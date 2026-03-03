import * as fabric from 'fabric';
import type {
  EditorDocument,
  TextLayerData,
  CanvasPreset,
} from '@social-posts-helper/core';
import { getPresetById } from '@social-posts-helper/core';

type SelectionCallback = (layerId: string | null) => void;
type ModifiedCallback = (
  layerId: string,
  changes: Partial<Omit<TextLayerData, 'id'>>,
) => void;

export class FabricAdapter {
  private canvas: fabric.Canvas;
  private onSelectionChange: SelectionCallback | null = null;
  private onObjectModified: ModifiedCallback | null = null;
  private objectMap = new Map<string, fabric.FabricObject>();
  private backgroundImage: fabric.FabricImage | null = null;
  private syncing = false;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasElement, {
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#1a1a2e',
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

    this.canvas.on('object:modified', (e) => {
      if (this.syncing) return;
      const obj = e.target;
      if (!obj) return;
      const layerId = this.getLayerIdFromObject(obj);
      if (!layerId) return;

      const changes: Partial<Omit<TextLayerData, 'id'>> = {
        x: Math.round(obj.left ?? 0),
        y: Math.round(obj.top ?? 0),
        width: Math.round((obj.width ?? 0) * (obj.scaleX ?? 1)),
        height: Math.round((obj.height ?? 0) * (obj.scaleY ?? 1)),
        rotation: Math.round(obj.angle ?? 0),
      };

      this.onObjectModified?.(layerId, changes);
    });
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
    this.canvas.setDimensions({
      width: preset.width * scale,
      height: preset.height * scale,
    });
    this.canvas.setZoom(scale);
  }

  syncDocument(doc: EditorDocument, selectedLayerId: string | null): void {
    this.syncing = true;
    const preset = getPresetById(doc.presetId);

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
      }
    }

    layers.forEach((layer, index) => {
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
      text: layer.text,
      left: layer.x,
      top: layer.y,
      width: layer.width,
      angle: layer.rotation,
      scaleX: 1,
      scaleY: layer.height / (textbox.height || 1),
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
    this.canvas.dispose();
    this.objectMap.clear();
    this.backgroundImage = null;
  }
}
