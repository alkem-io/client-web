import { List, ListProps } from '@mui/material';
import React, { FC } from 'react';
import { times } from 'lodash';
import CanvasListItem, { CanvasListItemCanvas, CanvasListItemSkeleton } from './CanvasListItem';
import { Identifiable } from '../../../shared/types/Identifiable';

interface CanvasListProps extends ListProps {
  entities: {
    canvases: CanvasListItemCanvas[];
    selectedCanvasId?: string;
  };
  actions: {
    onSelect?: (canvas: Identifiable) => void;
    onDelete?: (canvas: CanvasListItemCanvas) => void;
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
      {loading && times(3, i => <CanvasListItemSkeleton key={i} />)}
      {!loading &&
        canvases.map(c => (
          <CanvasListItem
            key={c.id}
            onClick={() => actions.onSelect && actions.onSelect(c)}
            canvas={c}
            onDelete={actions.onDelete}
            canDelete={options.canDelete}
            isSelected={c.id === selectedCanvasId}
          />
        ))}
    </List>
  );
};

export default CanvasList;
