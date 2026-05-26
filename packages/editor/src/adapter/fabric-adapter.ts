import * as fabric from 'fabric';
import type {
  BackgroundTransform,
  EditorDocument,
  TextLayerData,
  CanvasPreset,
} from '@mint/core';
import { getPresetById } from '@mint/core';
import { computeSnap, DEFAULT_SNAP_THRESHOLD, type SnapBox } from './snap';

type SelectionCallback = (layerId: string | null) => void;
type ModifiedCallback = (
  layerId: string,
  changes: Partial<Omit<TextLayerData, 'id'>>,
) => void;
type BackgroundTransformCallback = (transform: BackgroundTransform) => void;

const SCALE_THRESHOLD = 0.001;

const GUIDE_COLOR = '#2f9f7a';
const GUIDE_DASH = [4, 4];

/** Magic id we use to recognise the background image inside fabric events. */
const BACKGROUND_ID = '__mint_background__';

export class FabricAdapter {
  private canvas: fabric.Canvas;
  private onSelectionChange: SelectionCallback | null = null;
  private onObjectModified: ModifiedCallback | null = null;
  private onBackgroundTransform: BackgroundTransformCallback | null = null;
  private objectMap = new Map<string, fabric.FabricObject>();
  /**
   * Reverse lookup: fabric object → layer id. Avoids the O(n) scan in
   * `getLayerIdFromObject` on every selection/modified event.
   */
  private objectToId = new WeakMap<fabric.FabricObject, string>();
  private layerMap = new Map<string, TextLayerData>();
  private backgroundImage: fabric.FabricImage | null = null;
  /**
   * Tracks the dataURL the current `backgroundImage` was loaded from, so a
   * re-sync with the same dataURL can short-circuit. Kept as a WeakMap so
   * we don't graft a private field onto a fabric-owned object (the old
   * `obj as { _dataUrl?: string }` cast).
   */
  private backgroundImageSources = new WeakMap<fabric.FabricImage, string>();
  /**
   * Monotonic version stamp for the async background load. When the user
   * swaps backgrounds quickly the older Image's `onload` may fire after
   * the newer load has already settled; we compare the version at
   * dispatch time vs at completion to drop the stale result.
   */
  private bgLoadVersion = 0;
  private syncing = false;
  private guideLines: fabric.Line[] = [];
  private currentPreset: CanvasPreset | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasElement, {
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#e8f5ee',
    });

    this.canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const layerId = this.getLayerIdFromObject(obj);
        this.onSelectionChange?.(layerId);
      }
    });

    this.canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const layerId = this.getLayerIdFromObject(obj);
        this.onSelectionChange?.(layerId);
      }
    });

    this.canvas.on('selection:cleared', () => {
      this.onSelectionChange?.(null);
    });

    this.canvas.on('object:moving', (e) => {
      if (this.syncing || !this.currentPreset) return;
      const obj = e.target;
      if (!obj) return;
      // Don't try to snap-to-center the background image — it's almost
      // always larger than the canvas (cover fit) and the user is moving
      // it deliberately. Snap guides on bg drag would be jittery noise.
      if (
        (obj as fabric.FabricObject & { _mintId?: string })._mintId ===
        BACKGROUND_ID
      ) {
        return;
      }
      this.applySnapping(obj);
    });

    this.canvas.on('object:modified', (e) => {
      if (this.syncing) return;
      this.clearGuideLines();
      const obj = e.target;
      if (!obj) return;

      // Background image branch — emit a transform-change callback so the
      // store can persist the new x/y/scale. The bg image carries the
      // `BACKGROUND_ID` marker; only fall through to layer handling if
      // this isn't the background.
      if (
        this.backgroundImage &&
        (obj as fabric.FabricObject & { _mintId?: string })._mintId ===
          BACKGROUND_ID
      ) {
        const scaleX = obj.scaleX ?? 1;
        this.onBackgroundTransform?.({
          x: Math.round(obj.left ?? 0),
          y: Math.round(obj.top ?? 0),
          scale: Number(scaleX.toFixed(4)),
        });
        return;
      }

      const layerId = this.getLayerIdFromObject(obj);
      if (!layerId) return;

      const scaleX = obj.scaleX ?? 1;
      const scaleY = obj.scaleY ?? 1;
      const isCornerResize =
        Math.abs(scaleX - 1) > SCALE_THRESHOLD ||
        Math.abs(scaleY - 1) > SCALE_THRESHOLD;

      const baseChanges: Partial<Omit<TextLayerData, 'id'>> = {
        x: Math.round(obj.left ?? 0),
        y: Math.round(obj.top ?? 0),
        width: Math.round((obj.width ?? 0) * scaleX),
        height: Math.round((obj.height ?? 0) * scaleY),
        rotation: Math.round(obj.angle ?? 0),
        ...(obj instanceof fabric.Textbox ? { text: obj.text } : {}),
      };

      // Corner resize: scale font size proportionally, reset transform scale
      if (isCornerResize && obj instanceof fabric.Textbox) {
        const layer = this.layerMap.get(layerId);
        if (layer) {
          const newFontSize = Math.max(
            6,
            Math.round(layer.style.fontSize * scaleX),
          );
          this.onObjectModified?.(layerId, {
            ...baseChanges,
            style: { ...layer.style, fontSize: newFontSize },
          });
          return;
        }
      }

      this.onObjectModified?.(layerId, baseChanges);
    });
  }

  /**
   * Figma-style smart guides — the dragged object snaps to other layers'
   * left/center/right (and top/middle/bottom) edges, plus the canvas
   * centerlines. Logic is in `./snap.ts` so it stays unit-testable; this
   * method only handles the fabric ↔ pure-math glue and the guide-line
   * rendering.
   */
  private applySnapping(obj: fabric.FabricObject): void {
    if (!this.currentPreset) return;

    const draggedBox: SnapBox = {
      x: obj.left ?? 0,
      y: obj.top ?? 0,
      width: (obj.width ?? 0) * (obj.scaleX ?? 1),
      height: (obj.height ?? 0) * (obj.scaleY ?? 1),
    };

    // Collect snap targets from every other visible layer. Locked layers
    // stay as reference points — locking forbids editing, not visibility,
    // and Figma treats them the same way.
    const others: SnapBox[] = [];
    for (const [id, other] of this.objectMap) {
      if (other === obj) continue;
      const layer = this.layerMap.get(id);
      if (!layer || !layer.visible) continue;
      others.push({
        x: other.left ?? 0,
        y: other.top ?? 0,
        width: (other.width ?? 0) * (other.scaleX ?? 1),
        height: (other.height ?? 0) * (other.scaleY ?? 1),
      });
    }

    const result = computeSnap(
      draggedBox,
      others,
      this.currentPreset.width,
      this.currentPreset.height,
      DEFAULT_SNAP_THRESHOLD,
    );

    this.clearGuideLines();

    if (result.x) {
      obj.set({ left: (obj.left ?? 0) + result.x.delta });
      this.guideLines.push(this.drawGuide('vertical', result.x.guide));
    }
    if (result.y) {
      obj.set({ top: (obj.top ?? 0) + result.y.delta });
      this.guideLines.push(this.drawGuide('horizontal', result.y.guide));
    }

    this.canvas.requestRenderAll();
  }

  private drawGuide(
    orientation: 'vertical' | 'horizontal',
    coord: number,
  ): fabric.Line {
    if (!this.currentPreset) {
      throw new Error('drawGuide called without a current preset');
    }
    const coords: [number, number, number, number] =
      orientation === 'vertical'
        ? [coord, 0, coord, this.currentPreset.height]
        : [0, coord, this.currentPreset.width, coord];
    const line = new fabric.Line(coords, {
      stroke: GUIDE_COLOR,
      strokeWidth: 1,
      strokeDashArray: GUIDE_DASH,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    this.canvas.add(line);
    return line;
  }

  private clearGuideLines(): void {
    for (const line of this.guideLines) {
      this.canvas.remove(line);
    }
    this.guideLines = [];
  }

  setCallbacks(
    onSelectionChange: SelectionCallback,
    onObjectModified: ModifiedCallback,
    onBackgroundTransform?: BackgroundTransformCallback,
  ): void {
    this.onSelectionChange = onSelectionChange;
    this.onObjectModified = onObjectModified;
    this.onBackgroundTransform = onBackgroundTransform ?? null;
  }

  private getLayerIdFromObject(obj: fabric.FabricObject): string | null {
    return this.objectToId.get(obj) ?? null;
  }

  setDimensions(preset: CanvasPreset, scale: number): void {
    this.currentPreset = preset;
    this.canvas.setDimensions({
      width: preset.width * scale,
      height: preset.height * scale,
    });
    this.canvas.setZoom(scale);
  }

  syncDocument(doc: EditorDocument, selectedLayerId: string | null): void {
    this.syncing = true;
    const preset = getPresetById(doc.presetId);

    this.canvas.backgroundColor = doc.background.color || '#e8f5ee';
    this.syncBackground(doc.background, preset);
    this.syncLayers(doc.layers);
    this.syncSelection(selectedLayerId);

    this.canvas.requestRenderAll();
    this.syncing = false;
  }

  private syncBackground(
    background: EditorDocument['background'],
    preset: CanvasPreset,
  ): void {
    const { dataUrl, fit, manual } = background;

    if (!dataUrl) {
      if (this.backgroundImage) {
        this.canvas.remove(this.backgroundImage);
        this.backgroundImageSources.delete(this.backgroundImage);
        this.backgroundImage = null;
      }
      // Bump the version so any in-flight load resolves to a stale check
      // and drops the result (otherwise it would re-add the image after
      // the user cleared the background).
      this.bgLoadVersion += 1;
      return;
    }

    // Short-circuit when the dataURL matches the currently-loaded image —
    // only the fit / manual transform may have changed, no need to decode again.
    if (
      this.backgroundImage &&
      this.backgroundImageSources.get(this.backgroundImage) === dataUrl
    ) {
      this.applyBackgroundTransform(this.backgroundImage, fit, preset, manual);
      return;
    }

    if (this.backgroundImage) {
      this.canvas.remove(this.backgroundImage);
      this.backgroundImageSources.delete(this.backgroundImage);
    }

    // Race-guard: capture the version at dispatch and drop the result if
    // a newer load has started (or the bg was cleared) by the time the
    // browser finishes decoding this dataURL.
    this.bgLoadVersion += 1;
    const dispatchedVersion = this.bgLoadVersion;
    const imgElement = new Image();
    imgElement.src = dataUrl;
    imgElement.onload = () => {
      if (dispatchedVersion !== this.bgLoadVersion) return;
      const fabricImg = new fabric.FabricImage(imgElement, {
        // Draggable + scalable on the canvas so the user can frame the
        // photo by hand. Corner controls do uniform scale via `lockUniScaling`;
        // rotation is intentionally disabled (we don't store rotation in
        // BackgroundData) and the image can't be deleted from the canvas.
        selectable: true,
        evented: true,
        hasRotatingPoint: false,
        lockRotation: true,
        lockUniScaling: true,
        originX: 'left',
        originY: 'top',
      });
      // Marker so `object:modified` can tell bg from layer text without an
      // O(n) scan.
      (fabricImg as fabric.FabricObject & { _mintId?: string })._mintId =
        BACKGROUND_ID;
      // Hide the top-middle / left-middle / right-middle / bottom-middle
      // handles — the bg only resizes uniformly from corners.
      fabricImg.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: false,
      });
      this.backgroundImageSources.set(fabricImg, dataUrl);
      this.backgroundImage = fabricImg;
      this.applyBackgroundTransform(fabricImg, fit, preset, manual);
      this.canvas.insertAt(0, fabricImg);
      this.canvas.requestRenderAll();
    };
    imgElement.onerror = () => {
      // Failed to decode — clear the version stamp so subsequent valid
      // loads aren't accidentally dropped by the staleness check.
      if (dispatchedVersion === this.bgLoadVersion) {
        this.bgLoadVersion += 1;
      }
    };
  }

  /**
   * Apply either the manual override or the fit-derived auto layout to
   * the background image. Manual wins when set.
   */
  private applyBackgroundTransform(
    img: fabric.FabricImage,
    fit: 'contain' | 'cover',
    preset: CanvasPreset,
    manual: BackgroundTransform | null | undefined,
  ): void {
    if (manual) {
      img.set({
        scaleX: manual.scale,
        scaleY: manual.scale,
        left: manual.x,
        top: manual.y,
      });
      img.setCoords();
      return;
    }

    const imgW = img.width ?? 1;
    const imgH = img.height ?? 1;
    let scale: number;
    if (fit === 'contain') {
      scale = Math.min(preset.width / imgW, preset.height / imgH);
    } else {
      scale = Math.max(preset.width / imgW, preset.height / imgH);
    }
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: (preset.width - imgW * scale) / 2,
      top: (preset.height - imgH * scale) / 2,
    });
    img.setCoords();
  }

  private syncLayers(layers: readonly TextLayerData[]): void {
    const currentIds = new Set(layers.map((l) => l.id));

    for (const [id, obj] of this.objectMap) {
      if (!currentIds.has(id)) {
        this.canvas.remove(obj);
        this.objectMap.delete(id);
        this.objectToId.delete(obj);
        this.layerMap.delete(id);
      }
    }

    layers.forEach((layer, index) => {
      this.layerMap.set(layer.id, layer);
      let obj = this.objectMap.get(layer.id);

      if (!obj) {
        const textbox = new fabric.Textbox(layer.text, {
          left: layer.x,
          top: layer.y,
          width: layer.width,
          originX: 'left',
          originY: 'top',
        });
        this.objectMap.set(layer.id, textbox);
        this.objectToId.set(textbox, layer.id);
        this.canvas.add(textbox);
        obj = textbox;
      }

      this.applyLayerProps(obj as fabric.Textbox, layer);

      const bgOffset = this.backgroundImage ? 1 : 0;
      const targetIndex = bgOffset + index;
      const objects = this.canvas.getObjects();
      const currentIndex = objects.indexOf(obj);
      if (currentIndex !== targetIndex) {
        this.canvas.moveObjectTo(obj, targetIndex);
      }
    });
  }

  private applyLayerProps(textbox: fabric.Textbox, layer: TextLayerData): void {
    textbox.set({
      ...(textbox.isEditing ? {} : { text: layer.text }),
      left: layer.x,
      top: layer.y,
      width: layer.width,
      angle: layer.rotation,
      scaleX: 1,
      scaleY: 1,
      fontFamily: layer.style.fontFamily,
      fontSize: layer.style.fontSize,
      fontWeight: layer.style.fontWeight as string | number,
      fill: layer.style.color,
      opacity: layer.style.opacity,
      textAlign: layer.style.textAlign,
      lineHeight: layer.style.lineHeight,
      charSpacing: layer.style.letterSpacing * 10,
      visible: layer.visible,
      selectable: !layer.locked,
      evented: !layer.locked,
      lockMovementX: layer.locked,
      lockMovementY: layer.locked,
      lockRotation: layer.locked,
      lockScalingX: layer.locked,
      lockScalingY: layer.locked,
    });

    if (layer.style.background) {
      textbox.set({
        backgroundColor: layer.style.background.color,
        padding: layer.style.background.padding,
      });
    } else {
      textbox.set({
        backgroundColor: '',
        padding: 0,
      });
    }

    if (layer.style.shadow) {
      textbox.set({
        shadow: new fabric.Shadow({
          offsetX: layer.style.shadow.offsetX,
          offsetY: layer.style.shadow.offsetY,
          blur: layer.style.shadow.blur,
          color: layer.style.shadow.color,
        }),
      });
    } else {
      textbox.set({ shadow: undefined });
    }

    if (layer.style.stroke) {
      textbox.set({
        stroke: layer.style.stroke.color,
        strokeWidth: layer.style.stroke.width,
      });
    } else {
      textbox.set({ stroke: undefined, strokeWidth: 0 });
    }
  }

  private syncSelection(selectedLayerId: string | null): void {
    if (!selectedLayerId) {
      this.canvas.discardActiveObject();
      return;
    }

    const obj = this.objectMap.get(selectedLayerId);
    if (obj && obj.selectable) {
      this.canvas.setActiveObject(obj);
    }
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.canvas.getElement();
  }

  getExportDataUrl(
    preset: CanvasPreset,
    format: 'png' | 'jpeg' | 'webp',
    quality: number,
  ): string {
    const currentZoom = this.canvas.getZoom();
    const currentWidth = this.canvas.getWidth();
    const currentHeight = this.canvas.getHeight();

    this.clearGuideLines();

    this.canvas.setDimensions({ width: preset.width, height: preset.height });
    this.canvas.setZoom(1);
    this.canvas.requestRenderAll();

    // PNG ignores `quality`; JPEG and WebP both honor it (0..1).
    const usesQuality = format === 'jpeg' || format === 'webp';
    const dataUrl = this.canvas.toDataURL({
      format,
      quality: usesQuality ? quality / 100 : 1,
      multiplier: 1,
    });

    this.canvas.setDimensions({ width: currentWidth, height: currentHeight });
    this.canvas.setZoom(currentZoom);
    this.canvas.requestRenderAll();

    return dataUrl;
  }

  dispose(): void {
    this.clearGuideLines();
    this.canvas.dispose();
    this.objectMap.clear();
    this.layerMap.clear();
    // Bump the bg version so any in-flight `<img>.onload` aborts.
    this.bgLoadVersion += 1;
    this.backgroundImage = null;
    this.currentPreset = null;
  }
}
