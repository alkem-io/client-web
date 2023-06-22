import { Toolbar } from '@mui/material';
import React, { FC } from 'react';
import { Whiteboard } from '../../../../../core/apollo/generated/graphql-schema';

export interface WhiteboardToolbarEntities {
  whiteboard: Whiteboard;
}

export interface WhiteboardToolbarOptions {
  canEdit?: boolean;
}

export interface WhiteboardToolbarProps {
  entities: WhiteboardToolbarEntities;
  options?: WhiteboardToolbarOptions;
}

const WhiteboardToolbar: FC<WhiteboardToolbarProps> = () => {
  return <Toolbar>{'test'}</Toolbar>;
};

export default WhiteboardToolbar;
