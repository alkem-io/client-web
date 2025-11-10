import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
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
import { SpaceL1Icon } from '@/domain/space/icons/SpaceL1Icon';
import { GenericCalloutIcon } from '@/domain/collaboration/callout/icons/calloutIcons';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { MemoIcon } from '@/domain/collaboration/memo/icon/MemoIcon';

const ActivityIcon: Record<
  Exclude<ActivityEventType, ActivityEventType.CalloutPublished>,
  ComponentType<SvgIconProps>
> = {
  [ActivityEventType.MemberJoined]: PersonOutlined,
  [ActivityEventType.CalloutWhiteboardCreated]: WhiteboardIcon,
  [ActivityEventType.CalloutWhiteboardContentModified]: WhiteboardIcon,
  [ActivityEventType.CalloutMemoCreated]: MemoIcon,
  [ActivityEventType.CalloutPostCreated]: NotesOutlined,
  [ActivityEventType.CalloutPostComment]: ChatBubbleOutlineOutlined,
  [ActivityEventType.CalloutLinkCreated]: LinkOutlined,
  [ActivityEventType.SubspaceCreated]: SpaceL1Icon, // TODO: should it distinguish between L1 and L2?
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
    };

const getActivityIcon = (activity: Activity): ComponentType<SvgIconProps> => {
  if (activity.type === ActivityEventType.CalloutPublished) {
    return GenericCalloutIcon;
  }
  return ActivityIcon[activity.type];
};

export default getActivityIcon;
