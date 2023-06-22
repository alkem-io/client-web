import { List, ListProps } from '@mui/material';
import React, { FC } from 'react';
import { times } from 'lodash';
import WhiteboardListItem, { WhiteboardListItemWhiteboard, WhiteboardListItemSkeleton } from './WhiteboardListItem';
import { Identifiable } from '../../../shared/types/Identifiable';

interface WhiteboardListProps extends ListProps {
  entities: {
    whiteboards: WhiteboardListItemWhiteboard[];
    selectedWhiteboardId?: string;
  };
  actions: {
    onSelect?: (whiteboard: Identifiable) => void;
    onDelete?: (whiteboard: WhiteboardListItemWhiteboard) => void;
  };
  options: {
    canDelete?: boolean;
  };
  state: {
    loading;
  };
}

export const WhiteboardList: FC<WhiteboardListProps> = ({ entities, actions, options, state }) => {
  const { whiteboards, selectedWhiteboardId } = entities;
  const { loading } = state;

  return (
    <List>
      {loading && times(3, i => <WhiteboardListItemSkeleton key={i} />)}
      {!loading &&
        whiteboards.map(c => (
          <WhiteboardListItem
            key={c.id}
            onClick={() => actions.onSelect && actions.onSelect(c)}
            whiteboard={c}
            onDelete={actions.onDelete}
            canDelete={options.canDelete}
            isSelected={c.id === selectedWhiteboardId}
          />
        ))}
    </List>
  );
};

export default WhiteboardList;
