import { List, ListProps } from '@mui/material';
import React, { FC } from 'react';
import { CanvasWithoutValue } from '../../../../models/entities/canvas';
import CanvasListItem, { CanvasListItemSkeleton } from './CanvasListItem';

interface CanvasListProps extends ListProps {
  entities: {
    canvases: CanvasWithoutValue[];
    selectedCanvasId?: string;
  };
  actions: {
    onSelect?: (canvas: CanvasWithoutValue) => void;
    onDelete?: (canvas: CanvasWithoutValue) => void;
  };
  options: {
    canDelete?: boolean;
  };
  state: {
    loading;
  };
}

export const CanvasList: FC<CanvasListProps> = ({ entities, actions, options, state }) => {
  const { canvases, selectedCanvasId } = entities;
  const { loading } = state;

  return (
    <List>
      {loading && Array.apply(null, { length: 3 } as any).map((_, i) => <CanvasListItemSkeleton key={i} />)}
      {!loading &&
        canvases.map(c => (
          <CanvasListItem
            key={c.id}
            onClick={() => actions.onSelect && actions.onSelect(c)}
            entities={{
              canvas: c,
            }}
            actions={{
              onDelete: actions.onDelete,
            }}
            options={{
              ...options,
              isSelected: c.id === selectedCanvasId,
            }}
          />
        ))}
    </List>
  );
};

export default CanvasList;
