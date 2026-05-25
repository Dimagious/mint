import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  LockOpenOutlined,
  ContentCopy,
  DeleteOutline,
  MoreHoriz,
  DragIndicator,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { TextLayerData } from '@mint/core';

interface LayerListItemProps {
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
 * Layer card (BRIEF §5.1).
 *
 * Layout: [grip] [aA chip in layer's font] [name + style preview] [state pills] [more menu]
 *
 * - Default state: minimal — just name + sub-line + hidden/locked state pills if non-default.
 * - On hover OR selection: drag grip fades in (left) and more menu (3-dot) on the right.
 * - Selected: 2px mint left border + soft mint tint.
 * - Duplicate / delete / move up / move down live inside the more menu, not the row chrome.
 */
export const LayerListItem: React.FC<LayerListItemProps> = ({
  layer,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  emptyText = 'Empty text',
}) => {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);

  const closeMenu = () => setMenuAnchor(null);

  const stop = (fn: () => void) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    fn();
  };

  const styleSubline = [
    `${Math.round(layer.style.fontSize)} px`,
    layer.style.fontFamily,
    layer.style.color.toUpperCase(),
  ].join(' · ');

  return (
    <Box
      data-testid={`layer-item-${layer.id}`}
      onClick={onSelect}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.875,
        mb: 0.5,
        borderRadius: '10px',
        border: '1px solid transparent',
        cursor: 'pointer',
        transition: 'background .12s, border-color .12s',
        opacity: layer.visible ? 1 : 0.65,
        ...(isSelected
          ? {
              bgcolor: 'secondary.main',
              borderColor: 'primary.light',
            }
          : {
              '&:hover': { bgcolor: 'rgba(0,0,0,.03)' },
            }),
        '&:hover .layer-grip, &:hover .layer-actions, &[data-selected="true"] .layer-grip, &[data-selected="true"] .layer-actions':
          { opacity: 1 },
      }}
      data-selected={isSelected ? 'true' : 'false'}
    >
      <Box
        className="layer-grip"
        aria-label={t('layers.ariaGrip')}
        sx={{
          width: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
          opacity: 0,
          transition: 'opacity .12s',
          cursor: 'grab',
        }}
      >
        <DragIndicator sx={{ fontSize: 16 }} />
      </Box>

      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '8px',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: `"${layer.style.fontFamily}", sans-serif`,
          fontWeight: layer.style.fontWeight,
          fontSize: 14,
          color: 'text.primary',
          flexShrink: 0,
        }}
        aria-hidden
      >
        aA
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
          title={layer.text || emptyText}
        >
          {layer.text || emptyText}
        </Typography>
        <Typography
          variant="caption"
          className="tnum"
          sx={{
            display: 'block',
            color: 'text.disabled',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 11,
            mt: '2px',
          }}
        >
          {styleSubline}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={0.25}
        sx={{ color: 'text.disabled', mr: 0.25 }}
      >
        {!layer.visible && (
          <Tooltip title={t('layers.ariaShow')}>
            <IconButton
              size="small"
              sx={{ p: 0.5 }}
              onClick={stop(onToggleVisibility)}
            >
              <VisibilityOff sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {layer.locked && (
          <Tooltip title={t('layers.ariaUnlock')}>
            <IconButton
              size="small"
              sx={{ p: 0.5 }}
              onClick={stop(onToggleLock)}
            >
              <LockOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Box
        className="layer-actions"
        sx={{
          display: 'flex',
          gap: 0.25,
          opacity: 0,
          transition: 'opacity .12s',
        }}
      >
        <Tooltip
          title={layer.visible ? t('layers.ariaHide') : t('layers.ariaShow')}
        >
          <IconButton
            size="small"
            sx={{ p: 0.5 }}
            onClick={stop(onToggleVisibility)}
          >
            {layer.visible ? (
              <Visibility sx={{ fontSize: 16 }} />
            ) : (
              <VisibilityOff sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title={t('layers.ariaMore')}>
          <IconButton
            size="small"
            sx={{ p: 0.5 }}
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(e.currentTarget);
            }}
            aria-haspopup="true"
          >
            <MoreHoriz sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { minWidth: 180, boxShadow: '0 4px 12px rgba(0,0,0,.08)' },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onMoveUp();
            closeMenu();
          }}
          disabled={isLast || layer.locked}
        >
          <ArrowUpward sx={{ fontSize: 16, mr: 1 }} />
          {t('layers.ariaUp')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onMoveDown();
            closeMenu();
          }}
          disabled={isFirst || layer.locked}
        >
          <ArrowDownward sx={{ fontSize: 16, mr: 1 }} />
          {t('layers.ariaDown')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onToggleLock();
            closeMenu();
          }}
        >
          {layer.locked ? (
            <LockOpenOutlined sx={{ fontSize: 16, mr: 1 }} />
          ) : (
            <LockOutlined sx={{ fontSize: 16, mr: 1 }} />
          )}
          {layer.locked ? t('layers.ariaUnlock') : t('layers.ariaLock')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDuplicate();
            closeMenu();
          }}
        >
          <ContentCopy sx={{ fontSize: 16, mr: 1 }} />
          {t('layers.ariaDuplicate')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete();
            closeMenu();
          }}
          disabled={layer.locked}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutline sx={{ fontSize: 16, mr: 1 }} />
          {t('layers.ariaDelete')}
        </MenuItem>
      </Menu>
    </Box>
  );
};
