import { Toolbar } from '@mui/material';
import React, { FC } from 'react';
import { Canvas } from '../../../../models/graphql-schema';

export interface CanvasToolbarEntities {
  canvas: Canvas;
}

export interface CanvasToolbarOptions {
  canEdit?: boolean;
}

export interface CanvasToolbarProps {
  entities: CanvasToolbarEntities;
  options?: CanvasToolbarOptions;
}

const CanvasToolbar: FC<CanvasToolbarProps> = () => {
  return <Toolbar>{'test'}</Toolbar>;
};

export default CanvasToolbar;
