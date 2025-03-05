import { ComponentType } from 'react';
import { ProfileType } from '@/core/apollo/generated/graphql-schema';
import { SvgIconProps } from '@mui/material';
import { CalendarIcon } from '@/domain/timeline/calendar/icons/CalendarIcon';
import { InnovationFlowIcon } from '@/domain/collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import { CalloutIcon } from '@/domain/collaboration/callout/icon/CalloutIcon';
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
import calloutIcons from '@/domain/collaboration/callout/utils/calloutIcons';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import { warn } from '@/core/logging/sentry/log';

export const getProfileIcon = (profileType: ProfileType): ComponentType<SvgIconProps> => {
  switch (profileType) {
    case ProfileType.CalendarEvent:
      return CalendarIcon;
    case ProfileType.CalloutFraming:
      return CalloutIcon;
    case ProfileType.Template:
      return Campaign;
    case ProfileType.Discussion:
      return ChatBubbleOutline;
    case ProfileType.InnovationFlow:
      return InnovationFlowIcon as SvgIconComponent;
    case ProfileType.InnovationHub:
      return HubOutlined;
    case ProfileType.InnovationPack:
      return InventoryOutlined;
    case ProfileType.Organization:
      return CorporateFareOutlined;
    case ProfileType.Post:
      return calloutIcons.POST;
    case ProfileType.SpaceAbout:
      return SpaceIcon;
    case ProfileType.User:
      return PersonOutline;
    case ProfileType.UserGroup:
      return PeopleAltOutlined;
    case ProfileType.Whiteboard:
      return calloutIcons.WHITEBOARD;
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
