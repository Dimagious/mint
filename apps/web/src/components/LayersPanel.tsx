import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import {
  Add,
  FileUpload,
  ImageOutlined,
  HideImageOutlined,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@mint/editor';
import { LayerListItem } from '@mint/ui';
import { readImageFileSafely, ImageRejectedError } from '@mint/utils';
import type { TextLayerData } from '@mint/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PANEL_WIDTH = 280;

interface LayersPanelProps {
  mobile?: boolean;
  /** Used by the desktop top bar safe-zones toggle when it lives here (BRIEF §4.2 §3). */
  showSafeZones?: boolean;
  onToggleSafeZones?: (v: boolean) => void;
  /** Surfaced when the upload input rejects a file (MIME/size/magic check). */
  onImageRejected?: (code: ImageRejectedError['code']) => void;
}

/**
 * Left panel — Canvas & Layers (BRIEF §4.2).
 *
 * Merges the old "Background" and "Layers" panels into one panel with three
 * collapsible-style sections: Canvas, Layers, View.
 */
export const LayersPanel: React.FC<LayersPanelProps> = ({
  mobile = false,
  showSafeZones,
  onToggleSafeZones,
  onImageRejected,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const doc = useEditorStore((s) => s.document);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const removeTextLayer = useEditorStore((s) => s.removeTextLayer);
  const updateTextLayer = useEditorStore((s) => s.updateTextLayer);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const reorderLayerToIndex = useEditorStore((s) => s.reorderLayerToIndex);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const setBackground = useEditorStore((s) => s.setBackground);

  // DnD sensors — PointerSensor with a small activation distance keeps the
  // grip clickable, and KeyboardSensor gives non-mouse users space/enter
  // pickup + arrow-key reorder.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      // The Sortable list is keyed by layer ids in visual (top-of-stack first)
      // order, which is the reverse of doc.layers. Translate the drop target
      // back to the document's stacking index.
      const total = doc.layers.length;
      const visualOrder = doc.layers.map((l) => l.id).reverse();
      const visualTo = visualOrder.indexOf(String(over.id));
      if (visualTo === -1) return;
      const newDocIndex = total - 1 - visualTo;
      reorderLayerToIndex(String(active.id), newDocIndex);
    },
    [doc.layers, reorderLayerToIndex],
  );

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const dataUrl = await readImageFileSafely(file);
        setBackground({ ...doc.background, dataUrl });
      } catch (err) {
        if (err instanceof ImageRejectedError) {
          onImageRejected?.(err.code);
        } else {
          throw err;
        }
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [setBackground, doc.background, onImageRejected],
  );

  const reversed = [...doc.layers].reverse();

  return (
    <Paper
      elevation={0}
      data-testid={mobile ? 'layers-panel-mobile' : 'layers-panel'}
      sx={{
        width: mobile ? '100%' : PANEL_WIDTH,
        minWidth: mobile ? 0 : PANEL_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderRight: mobile ? 0 : 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflowY: 'auto',
      }}
    >
      {/* ─── Canvas section ─── */}
      <Section title={t('layers.canvas')}>
        <Box
          component="label"
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            minHeight: 116,
            px: 1.5,
            py: 1.75,
            border: `1.5px dashed ${theme.palette.divider}`,
            borderRadius: '12px',
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.secondary,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color .15s, background .15s, color .15s',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              background: theme.palette.secondary.main,
              color: theme.palette.primary.dark,
            },
          })}
        >
          {uploading ? (
            <CircularProgress size={20} />
          ) : (
            <FileUpload sx={{ fontSize: 22 }} />
          )}
          <Typography
            variant="body2"
            sx={{ color: 'text.primary', fontWeight: 600 }}
          >
            {uploading ? t('layers.uploading') : t('layers.uploadImage')}
          </Typography>
          {!uploading && (
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}
            >
              {t('layers.uploadHint')}
            </Typography>
          )}
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={onUpload}
            data-testid="bg-upload"
          />
        </Box>

        {doc.background.dataUrl && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              fullWidth
              startIcon={<ImageOutlined />}
              onClick={() =>
                setBackground({
                  ...doc.background,
                  fit: doc.background.fit === 'contain' ? 'cover' : 'contain',
                })
              }
            >
              {doc.background.fit === 'cover'
                ? t('layers.fitCover')
                : t('layers.fitContain')}
            </Button>
            <Button
              size="small"
              fullWidth
              color="error"
              startIcon={<HideImageOutlined />}
              onClick={() =>
                setBackground({ ...doc.background, dataUrl: null })
              }
            >
              {t('layers.removeImage')}
            </Button>
          </Stack>
        )}

        <Box sx={{ mt: 1.75 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {t('layers.bgColor')}
          </Typography>
          <input
            type="color"
            value={doc.background.color || '#e8f5ee'}
            onChange={(e) =>
              setBackground({ ...doc.background, color: e.target.value })
            }
            style={{
              width: '100%',
              height: 32,
              padding: 0,
              border: '1px solid rgba(0,0,0,.07)',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          />
          {doc.background.dataUrl && (
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 0.5, color: 'text.disabled' }}
            >
              {t('layers.bgColorHint')}
            </Typography>
          )}
        </Box>
      </Section>

      {/* ─── Layers section ─── */}
      <Section
        title={t('layers.title')}
        badge={String(doc.layers.length)}
        action={
          <Button
            size="small"
            startIcon={<Add sx={{ fontSize: 16 }} />}
            onClick={() => addTextLayer()}
            sx={{
              color: 'primary.dark',
              '&:hover': { background: 'secondary.main' },
            }}
            data-testid="layers-add"
          >
            {t('layers.add')}
          </Button>
        }
      >
        {reversed.length === 0 ? (
          <EmptyLayersHint />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={reversed.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <List sx={{ p: 0 }}>
                {reversed.map((layer, visualIndex) => {
                  const actualIndex = doc.layers.length - 1 - visualIndex;
                  return (
                    <SortableLayer
                      key={layer.id}
                      layer={layer}
                      isSelected={layer.id === selectedLayerId}
                      onSelect={() => selectLayer(layer.id)}
                      onDelete={() => removeTextLayer(layer.id)}
                      onDuplicate={() => duplicateLayer(layer.id)}
                      onToggleVisibility={() =>
                        updateTextLayer(layer.id, { visible: !layer.visible })
                      }
                      onToggleLock={() =>
                        updateTextLayer(layer.id, { locked: !layer.locked })
                      }
                      onMoveUp={() => reorderLayer(layer.id, 'up')}
                      onMoveDown={() => reorderLayer(layer.id, 'down')}
                      isFirst={actualIndex === 0}
                      isLast={actualIndex === doc.layers.length - 1}
                      emptyText={t('layers.emptyText')}
                    />
                  );
                })}
              </List>
            </SortableContext>
          </DndContext>
        )}
      </Section>

      {/* ─── View section ─── */}
      {onToggleSafeZones && (
        <Section title={t('layers.view')}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('toolbar.safeZones')}
            </Typography>
            <Switch
              size="small"
              checked={!!showSafeZones}
              onChange={(e) => onToggleSafeZones(e.target.checked)}
              inputProps={{ 'aria-label': t('toolbar.safeZones') }}
            />
          </Stack>
        </Section>
      )}
    </Paper>
  );
};

/* ─────────── Internal building blocks ─────────── */

interface SortableLayerProps {
  layer: TextLayerData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  emptyText?: string;
}

/**
 * Adapter that hooks dnd-kit's `useSortable` into our presentational
 * `<LayerListItem>` via its `drag` prop. Keeps @mint/ui dnd-agnostic.
 */
const SortableLayer: React.FC<SortableLayerProps> = (props) => {
  const sortable = useSortable({ id: props.layer.id });
  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = sortable;

  return (
    <LayerListItem
      {...props}
      drag={{
        setRootRef: setNodeRef,
        rootStyle: {
          transform: CSS.Transform.toString(transform),
          transition,
        },
        dragHandleProps: { ...attributes, ...listeners },
        isDragging,
      }}
    />
  );
};

const Section: React.FC<{
  title: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, badge, action, children }) => (
  <Box
    sx={{
      px: 2,
      py: 2.25,
      borderBottom: 1,
      borderColor: 'divider',
      '&:last-child': { borderBottom: 0 },
    }}
  >
    <Stack direction="row" alignItems="center" sx={{ mb: 1.25 }}>
      <Typography variant="subtitle2">
        {title}
        {badge != null && (
          <Box
            component="span"
            sx={{
              ml: 1,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'none',
              bgcolor: 'background.default',
              color: 'text.secondary',
              borderRadius: '999px',
              px: 0.875,
              py: '1px',
            }}
          >
            {badge}
          </Box>
        )}
      </Typography>
      {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
    </Stack>
    {children}
  </Box>
);

const EmptyLayersHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ListItem
      disableGutters
      sx={{ display: 'block', textAlign: 'center', py: 2.5, px: 2 }}
    >
      <Box
        sx={{
          mx: 'auto',
          mb: 1.25,
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: 'secondary.main',
          color: 'primary.dark',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        <Add fontSize="small" />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        {t('layers.emptyHint')}
      </Typography>
      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 0.5, color: 'text.disabled' }}
      >
        {t('layers.emptyHintImage')}
      </Typography>
    </ListItem>
  );
};
