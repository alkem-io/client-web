import { CalloutContributionType, CalloutState, CalloutType } from '@core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { ReferenceIcon } from '../../../shared/components/References/icons/ReferenceIcon';
import { BlockOutlined, ForumOutlined, LibraryBooksOutlined } from '@mui/icons-material';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';
import calloutIcons from '../utils/calloutIcons';

export interface ContributionPolicy {
  allowedContributionTypes: CalloutContributionType[];
  state: CalloutState;
}

export const getCalloutTypeIcon = ({
  type,
  contributionPolicy,
}: {
  type: CalloutType;
  contributionPolicy: ContributionPolicy | undefined;
}) => {
  switch (type) {
    case CalloutType.Post:
      if (!contributionPolicy) {
        return calloutIcons[type];
      }

      return contributionPolicy.state === CalloutState.Open ? ForumOutlined : BlockOutlined;
    default:
      return calloutIcons[type];
  }
};

export const CONTRIBUTION_ICON: Record<CalloutContributionType, ComponentType<SvgIconProps>> = {
  [CalloutContributionType.Link]: ReferenceIcon,
  [CalloutContributionType.Post]: LibraryBooksOutlined,
  [CalloutContributionType.Whiteboard]: WhiteboardIcon,
};
