import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import {
  FormatListBulletedOutlined,
  LibraryBooksOutlined,
  NotesOutlined,
  PhotoLibraryOutlined,
} from '@mui/icons-material';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';

const calloutIcons: Record<CalloutType, ComponentType<SvgIconProps>> = {
  [CalloutType.PostCollection]: LibraryBooksOutlined,
  [CalloutType.WhiteboardCollection]: PhotoLibraryOutlined,
  [CalloutType.Post]: NotesOutlined,
  [CalloutType.LinkCollection]: FormatListBulletedOutlined,
  [CalloutType.Whiteboard]: WhiteboardIcon,
  [CalloutType.MemberGuidelines]: HandshakeOutlinedIcon,
} as const;

export default calloutIcons;
