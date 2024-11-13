import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { CalloutType } from '@core/apollo/generated/graphql-schema';
import {
  FormatListBulletedOutlined,
  ForumOutlined,
  LibraryBooksOutlined,
  PhotoLibraryOutlined,
} from '@mui/icons-material';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';

const calloutIcons: Record<CalloutType, ComponentType<SvgIconProps>> = {
  [CalloutType.PostCollection]: LibraryBooksOutlined,
  [CalloutType.WhiteboardCollection]: PhotoLibraryOutlined,
  [CalloutType.Post]: ForumOutlined,
  [CalloutType.LinkCollection]: FormatListBulletedOutlined,
  [CalloutType.Whiteboard]: WhiteboardIcon,
} as const;

export default calloutIcons;
