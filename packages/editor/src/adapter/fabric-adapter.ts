import * as fabric from 'fabric';
import type { EditorDocument, TextLayerData, CanvasPreset } from '@mint/core';
import { getPresetById } from '@mint/core';

type SelectionCallback = (layerId: string | null) => void;
type ModifiedCallback = (
  layerId: string,
  changes: Partial<Omit<TextLayerData, 'id'>>,
) => void;

const SCALE_THRESHOLD = 0.001;

const SNAP_THRESHOLD = 8;
const GUIDE_COLOR = '#2f9f7a';
const GUIDE_DASH = [4, 4];

export class FabricAdapter {
  private canvas: fabric.Canvas;
  private onSelectionChange: SelectionCallback | null = null;
  private onObjectModified: ModifiedCallback | null = null;
  private objectMap = new Map<string, fabric.FabricObject>();
  private layerMap = new Map<string, TextLayerData>();
  private backgroundImage: fabric.FabricImage | null = null;
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
      this.snapToCenter(obj);
    });

    this.canvas.on('object:modified', (e) => {
      if (this.syncing) return;
      this.clearGuideLines();
      const obj = e.target;
      if (!obj) return;
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

  private snapToCenter(obj: fabric.FabricObject): void {
    if (!this.currentPreset) return;

    const canvasCenterX = this.currentPreset.width / 2;
    const canvasCenterY = this.currentPreset.height / 2;

    const objCenterX =
      (obj.left ?? 0) + ((obj.width ?? 0) * (obj.scaleX ?? 1)) / 2;
    const objCenterY =
      (obj.top ?? 0) + ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2;

    this.clearGuideLines();

    let snappedX = false;
    let snappedY = false;

    if (Math.abs(objCenterX - canvasCenterX) < SNAP_THRESHOLD) {
      obj.set({
        left: canvasCenterX - ((obj.width ?? 0) * (obj.scaleX ?? 1)) / 2,
      });
      snappedX = true;
    }

    if (Math.abs(objCenterY - canvasCenterY) < SNAP_THRESHOLD) {
      obj.set({
        top: canvasCenterY - ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2,
      });
      snappedY = true;
    }

    if (snappedX) {
      const vLine = new fabric.Line(
        [canvasCenterX, 0, canvasCenterX, this.currentPreset.height],
        {
          stroke: GUIDE_COLOR,
          strokeWidth: 1,
          strokeDashArray: GUIDE_DASH,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        },
      );
      this.canvas.add(vLine);
      this.guideLines.push(vLine);
    }

    if (snappedY) {
      const hLine = new fabric.Line(
        [0, canvasCenterY, this.currentPreset.width, canvasCenterY],
        {
          stroke: GUIDE_COLOR,
          strokeWidth: 1,
          strokeDashArray: GUIDE_DASH,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        },
      );
      this.canvas.add(hLine);
      this.guideLines.push(hLine);
    }

    this.canvas.requestRenderAll();
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
  ): void {
    this.onSelectionChange = onSelectionChange;
    this.onObjectModified = onObjectModified;
  }

  private getLayerIdFromObject(obj: fabric.FabricObject): string | null {
    for (const [id, o] of this.objectMap) {
      if (o === obj) return id;
    }
    return null;
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
    this.syncBackground(doc.background.dataUrl, doc.background.fit, preset);
    this.syncLayers(doc.layers);
    this.syncSelection(selectedLayerId);

    this.canvas.requestRenderAll();
    this.syncing = false;
  }

  private syncBackground(
    dataUrl: string | null,
    fit: 'contain' | 'cover',
    preset: CanvasPreset,
  ): void {
    if (!dataUrl) {
      if (this.backgroundImage) {
        this.canvas.remove(this.backgroundImage);
        this.backgroundImage = null;
      }
      return;
    }

    if (
      this.backgroundImage &&
      (this.backgroundImage as fabric.FabricObject & { _dataUrl?: string })
        ._dataUrl === dataUrl
    ) {
      this.applyBackgroundFit(this.backgroundImage, fit, preset);
      return;
    }

    if (this.backgroundImage) {
      this.canvas.remove(this.backgroundImage);
    }

    const imgElement = new Image();
    imgElement.src = dataUrl;
    imgElement.onload = () => {
      const fabricImg = new fabric.FabricImage(imgElement, {
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      });

      (fabricImg as fabric.FabricObject & { _dataUrl?: string })._dataUrl =
        dataUrl;

      this.backgroundImage = fabricImg;
      this.applyBackgroundFit(fabricImg, fit, preset);
      this.canvas.insertAt(0, fabricImg);
      this.canvas.requestRenderAll();
    };
  }

  private applyBackgroundFit(
    img: fabric.FabricImage,
    fit: 'contain' | 'cover',
    preset: CanvasPreset,
  ): void {
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
  }

  private syncLayers(layers: readonly TextLayerData[]): void {
    const currentIds = new Set(layers.map((l) => l.id));

    for (const [id, obj] of this.objectMap) {
      if (!currentIds.has(id)) {
        this.canvas.remove(obj);
        this.objectMap.delete(id);
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
    format: string,
    quality: number,
  ): string {
    const currentZoom = this.canvas.getZoom();
    const currentWidth = this.canvas.getWidth();
    const currentHeight = this.canvas.getHeight();

    this.clearGuideLines();

    this.canvas.setDimensions({ width: preset.width, height: preset.height });
    this.canvas.setZoom(1);
    this.canvas.requestRenderAll();

    const multiplier = 1;
    const dataUrl = this.canvas.toDataURL({
      format: format === 'jpeg' ? 'jpeg' : 'png',
      quality: format === 'jpeg' ? quality / 100 : 1,
      multiplier,
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
    this.backgroundImage = null;
    this.currentPreset = null;
  }
}
