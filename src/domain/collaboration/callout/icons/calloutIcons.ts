import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { FormatListBulletedOutlined, LibraryBooksOutlined } from '@mui/icons-material';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { ReferenceIcon } from '@/domain/shared/components/References/icons/ReferenceIcon';
import { MemoIcon } from '@/domain/collaboration/memo/icon/MemoIcon';

export const GenericCalloutIcon = LibraryBooksOutlined;

export const calloutFramingIcons: Record<CalloutFramingType, ComponentType<SvgIconProps>> = {
  [CalloutFramingType.None]: LibraryBooksOutlined,
  [CalloutFramingType.Memo]: MemoIcon,
  [CalloutFramingType.Whiteboard]: WhiteboardIcon,
  [CalloutFramingType.Link]: FormatListBulletedOutlined,
};

export const contributionIcons: Record<CalloutContributionType, ComponentType<SvgIconProps>> = {
  [CalloutContributionType.Link]: ReferenceIcon,
  [CalloutContributionType.Post]: LibraryBooksOutlined,
  [CalloutContributionType.Memo]: MemoIcon,
  [CalloutContributionType.Whiteboard]: WhiteboardIcon,
};
