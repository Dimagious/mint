import React from 'react';
import { ListItem, ListItemText, IconButton, Stack } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  Delete,
  ArrowUpward,
  ArrowDownward,
  ContentCopy,
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

  return (
    <ListItem
      onClick={onSelect}
      sx={{
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        borderRadius: 1,
        mb: 0.5,
        cursor: 'pointer',
        opacity: layer.visible ? 1 : 0.5,
        '&:hover': { bgcolor: 'action.hover' },
        pr: '196px',
      }}
      secondaryAction={
        <Stack direction="row" spacing={0}>
          <IconButton
            size="small"
            aria-label={t('layers.ariaUp')}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={isLast || layer.locked}
          >
            <ArrowUpward fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={t('layers.ariaDown')}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={isFirst || layer.locked}
          >
            <ArrowDownward fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={
              layer.visible ? t('layers.ariaHide') : t('layers.ariaShow')
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
          >
            {layer.visible ? (
              <Visibility fontSize="small" />
            ) : (
              <VisibilityOff fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            aria-label={
              layer.locked ? t('layers.ariaUnlock') : t('layers.ariaLock')
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
          >
            {layer.locked ? (
              <Lock fontSize="small" />
            ) : (
              <LockOpen fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            aria-label={t('layers.ariaDuplicate')}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label={t('layers.ariaDelete')}
            disabled={layer.locked}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{ '&:hover:not(:disabled)': { color: 'error.main' } }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      <ListItemText
        primary={layer.text || emptyText}
        primaryTypographyProps={{
          noWrap: true,
          fontSize: '0.85rem',
        }}
      />
    </ListItem>
  );
};
