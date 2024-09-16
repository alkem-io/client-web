import { ComponentType } from 'react';
import { ProfileType } from '../../../core/apollo/generated/graphql-schema';
import { SvgIconProps } from '@mui/material';
import { CalendarIcon } from '../../timeline/calendar/icons/CalendarIcon';
import { SubspaceIcon } from '../../journey/subspace/icon/SubspaceIcon';
import { OpportunityIcon } from '../../journey/opportunity/icon/OpportunityIcon';
import { InnovationFlowIcon } from '../../collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import { CalloutIcon } from '../../collaboration/callout/icon/CalloutIcon';
import {
  Campaign,
  ChatBubbleOutline,
  CorporateFareOutlined,
  Face5,
  Face6,
  HubOutlined,
  ImageNotSupportedOutlined,
  InventoryOutlined,
  PeopleAltOutlined,
  PersonOutline,
  SvgIconComponent,
} from '@mui/icons-material';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import calloutIcons from '../../collaboration/callout/utils/calloutIcons';
import { SpaceIcon } from '../../journey/space/icon/SpaceIcon';
import { warn } from '../../../core/logging/sentry/log';

export const getProfileIcon = (profileType: ProfileType): ComponentType<SvgIconProps> => {
  switch (profileType) {
    case ProfileType.CalendarEvent:
      return CalendarIcon;
    case ProfileType.CalloutFraming:
      return CalloutIcon;
    case ProfileType.CalloutTemplate:
      return Campaign;
    case ProfileType.Challenge:
      return SubspaceIcon;
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
      return calloutIcons.POST;
    case ProfileType.PostTemplate:
      return calloutIcons.POST_COLLECTION;
    case ProfileType.CommunityGuidelinesTemplate:
      return HandshakeOutlinedIcon;
    case ProfileType.Space:
      return SpaceIcon;
    case ProfileType.User:
      return PersonOutline;
    case ProfileType.UserGroup:
      return PeopleAltOutlined;
    case ProfileType.Whiteboard:
      return calloutIcons.WHITEBOARD;
    case ProfileType.WhiteboardTemplate:
      return calloutIcons.WHITEBOARD_COLLECTION;
    case ProfileType.ContributionLink:
      return calloutIcons.LINK_COLLECTION;
    case ProfileType.CommunityGuidelines:
      return calloutIcons.POST; // TODO: Choose a more appropriate icon
    case ProfileType.VirtualPersona:
      return Face5; // TODO: Choose a more appropriate icon
    case ProfileType.VirtualContributor:
      return Face6; // TODO: Choose a more appropriate icon
    default: {
      warn(`Icon not specified for ProfileType ${profileType}`);
      return ImageNotSupportedOutlined;
    }
  }
};
