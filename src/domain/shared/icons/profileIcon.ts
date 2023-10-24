import { ComponentType } from 'react';
import { ProfileType } from '../../../core/apollo/generated/graphql-schema';
import { SvgIconProps } from '@mui/material';
import { CalendarIcon } from '../../timeline/calendar/icons/CalendarIcon';
import { ChallengeIcon } from '../../journey/challenge/icon/ChallengeIcon';
import { OpportunityIcon } from '../../journey/opportunity/icon/OpportunityIcon';
import { InnovationFlowIcon } from '../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import {
  FileOpenOutlined,
  ChatBubbleOutline,
  HubOutlined,
  InventoryOutlined,
  CorporateFareOutlined,
  PersonOutline,
  PeopleAltOutlined,
  SvgIconComponent,
} from '@mui/icons-material';
import { PostIcon } from '../../collaboration/post/icon/PostIcon';
import { SpaceIcon } from '../../journey/space/icon/SpaceIcon';
import { WhiteboardIcon } from '../../collaboration/whiteboard/icon/WhiteboardIcon';

export const profileIcon = (profileType: ProfileType): ComponentType<SvgIconProps> => {
  switch (profileType) {
    case ProfileType.CalendarEvent:
      return CalendarIcon;
    case ProfileType.CalloutFraming:
      return ChallengeIcon;
    case ProfileType.CalloutTemplate:
      return FileOpenOutlined;
    case ProfileType.Challenge:
      return ChallengeIcon;
    case ProfileType.Discussion:
      return ChatBubbleOutline;
    case ProfileType.InnovationFlow:
      return InnovationFlowIcon as SvgIconComponent;
    case ProfileType.InnovationFlowTemplate:
      return InnovationFlowIcon as SvgIconComponent;
    case ProfileType.InnovationHub:
      return HubOutlined;
    case ProfileType.InnovationPack:
      return InventoryOutlined;
    case ProfileType.Opportunity:
      return OpportunityIcon;
    case ProfileType.Organization:
      return CorporateFareOutlined;
    case ProfileType.Post:
      return PostIcon;
    case ProfileType.PostTemplate:
      return PostIcon;
    case ProfileType.Space:
      return SpaceIcon;
    case ProfileType.User:
      return PersonOutline;
    case ProfileType.UserGroup:
      return PeopleAltOutlined;
    case ProfileType.Whiteboard:
      return WhiteboardIcon;
    case ProfileType.WhiteboardRt:
      return WhiteboardIcon;
    case ProfileType.WhiteboardTemplate:
      return WhiteboardIcon;
  }
};
