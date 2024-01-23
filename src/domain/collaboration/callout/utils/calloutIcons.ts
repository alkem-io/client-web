import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import {
  DrawOutlined,
  FormatListBulletedOutlined,
  LibraryBooksOutlined,
  NotesOutlined,
  PhotoLibraryOutlined,
} from '@mui/icons-material';

const calloutIcons: Record<CalloutType, ComponentType<SvgIconProps>> = {
  [CalloutType.PostCollection]: LibraryBooksOutlined,
  [CalloutType.WhiteboardCollection]: PhotoLibraryOutlined,
  [CalloutType.Post]: NotesOutlined,
  [CalloutType.LinkCollection]: FormatListBulletedOutlined,
  [CalloutType.Whiteboard]: DrawOutlined,
  [CalloutType.WhiteboardRt]: DrawOutlined,
} as const;

export default calloutIcons;
