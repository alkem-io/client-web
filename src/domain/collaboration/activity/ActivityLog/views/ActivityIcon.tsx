import { ActivityEventType, CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import {
  CalendarMonthOutlined,
  ChatBubbleOutlineOutlined,
  LinkOutlined,
  MicOutlined,
  NotesOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import { SubspaceIcon } from '../../../../journey/subspace/icon/SubspaceIcon';
import { OpportunityIcon } from '../../../../journey/opportunity/icon/OpportunityIcon';
import calloutIcons from '../../../callout/utils/calloutIcons';
import { WhiteboardIcon } from '../../../whiteboard/icon/WhiteboardIcon';

const ActivityIcon: Record<
  Exclude<ActivityEventType, ActivityEventType.CalloutPublished>,
  ComponentType<SvgIconProps>
> = {
  [ActivityEventType.MemberJoined]: PersonOutlined,
  [ActivityEventType.CalloutWhiteboardCreated]: WhiteboardIcon,
  [ActivityEventType.CalloutWhiteboardContentModified]: WhiteboardIcon,
  [ActivityEventType.CalloutPostCreated]: NotesOutlined,
  [ActivityEventType.CalloutPostComment]: ChatBubbleOutlineOutlined,
  [ActivityEventType.CalloutLinkCreated]: LinkOutlined,
  [ActivityEventType.ChallengeCreated]: SubspaceIcon,
  [ActivityEventType.OpportunityCreated]: OpportunityIcon,
  [ActivityEventType.UpdateSent]: MicOutlined,
  [ActivityEventType.CalendarEventCreated]: CalendarMonthOutlined,
  [ActivityEventType.DiscussionComment]: ChatBubbleOutlineOutlined,
} as const;

export type Activity =
  | {
      type: Exclude<ActivityEventType, ActivityEventType.CalloutPublished>;
    }
  | {
      type: ActivityEventType.CalloutPublished;
      calloutType: CalloutType;
    };

const getActivityIcon = (activity: Activity): ComponentType<SvgIconProps> => {
  if (activity.type === ActivityEventType.CalloutPublished) {
    return calloutIcons[activity.calloutType];
  }
  return ActivityIcon[activity.type];
};

export default getActivityIcon;
