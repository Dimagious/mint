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
} from '@mui/icons-material';
import type { TextLayerData } from '@social-posts-helper/core';

interface LayerListItemProps {
  layer: TextLayerData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const LayerListItem: React.FC<LayerListItemProps> = ({
  layer,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
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
      }}
      secondaryAction={
        <Stack direction="row" spacing={0}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={isLast}
          >
            <ArrowUpward fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={isFirst}
          >
            <ArrowDownward fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      <ListItemText
        primary={layer.text.slice(0, 30) || 'Empty text'}
        primaryTypographyProps={{
          noWrap: true,
          fontSize: '0.85rem',
        }}
      />
    </ListItem>
  );
};
