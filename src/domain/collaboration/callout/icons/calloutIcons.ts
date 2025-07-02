import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { CalloutContributionType, CalloutType } from '@/core/apollo/generated/graphql-schema';
import {
  FormatListBulletedOutlined,
  ForumOutlined,
  LibraryBooksOutlined,
  PhotoLibraryOutlined,
} from '@mui/icons-material';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { ReferenceIcon } from '@/domain/shared/components/References/icons/ReferenceIcon';

const calloutIcons: Record<CalloutType, ComponentType<SvgIconProps>> = {
  [CalloutType.PostCollection]: LibraryBooksOutlined,
  [CalloutType.WhiteboardCollection]: PhotoLibraryOutlined,
  [CalloutType.Post]: ForumOutlined,
  [CalloutType.LinkCollection]: FormatListBulletedOutlined,
  [CalloutType.Whiteboard]: WhiteboardIcon,
} as const;

/**
 * // TODO: In the future this might be the only Callout Icon, as we are ditching the type field
 */
export const GenericCalloutIcon = LibraryBooksOutlined;

export default calloutIcons;

export const CONTRIBUTION_ICON: Record<CalloutContributionType, ComponentType<SvgIconProps>> = {
  [CalloutContributionType.Link]: ReferenceIcon,
  [CalloutContributionType.Post]: LibraryBooksOutlined,
  [CalloutContributionType.Whiteboard]: WhiteboardIcon,
};
