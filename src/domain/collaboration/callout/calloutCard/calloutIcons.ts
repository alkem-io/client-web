import { CalloutContributionType, CalloutType } from '@/core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { ReferenceIcon } from '@/domain/shared/components/References/icons/ReferenceIcon';
import { BlockOutlined, ForumOutlined, LibraryBooksOutlined } from '@mui/icons-material';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import calloutIcons from '../utils/calloutIcons';

export interface ContributionSettings {
  enabled: boolean;
}

export const getCalloutTypeIcon = ({
  type,
  settings,
}: {
  type: CalloutType;
  settings?: { contribution?: ContributionSettings };
}) => {
  switch (type) {
    case CalloutType.Post:
      if (!settings) {
        return calloutIcons[type];
      }

      return settings.contribution?.enabled ? ForumOutlined : BlockOutlined;
    default:
      return calloutIcons[type];
  }
};

export const CONTRIBUTION_ICON: Record<CalloutContributionType, ComponentType<SvgIconProps>> = {
  [CalloutContributionType.Link]: ReferenceIcon,
  [CalloutContributionType.Post]: LibraryBooksOutlined,
  [CalloutContributionType.Whiteboard]: WhiteboardIcon,
};
