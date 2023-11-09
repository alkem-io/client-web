import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { LibraryBooksOutlined } from '@mui/icons-material';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import NotesIcon from '@mui/icons-material/Notes';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';

const calloutIcons: Record<CalloutType, ComponentType<SvgIconProps>> = {
  [CalloutType.PostCollection]: LibraryBooksOutlined,
  [CalloutType.WhiteboardCollection]: FilterNoneIcon,
  [CalloutType.Post]: NotesIcon,
  [CalloutType.LinkCollection]: AttachFileIcon,
  [CalloutType.Whiteboard]: DrawOutlinedIcon,
  [CalloutType.WhiteboardRt]: DrawOutlinedIcon,
};

export default calloutIcons;
