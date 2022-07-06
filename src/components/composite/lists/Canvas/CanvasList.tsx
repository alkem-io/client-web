import { List, ListProps } from '@mui/material';
import React, { FC } from 'react';
// import { CanvasWithoutValue } from '../../../../models/entities/canvas';
import { CanvasDetailsFragment } from '../../../../models/graphql-schema';
import CanvasListItem, { CanvasListItemSkeleton } from './CanvasListItem';

interface CanvasListProps extends ListProps {
  entities: {
    canvases: CanvasDetailsFragment[];
    selectedCanvasId?: string;
  };
  actions: {
    onSelect?: (canvas: CanvasDetailsFragment) => void;
    onDelete?: (canvas: CanvasDetailsFragment) => void;
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
            canvas={c}
            onDelete={actions.onDelete}
            isSelected={c.id === selectedCanvasId}
            {...options}
          />
        ))}
    </List>
  );
};

export default CanvasList;
