import { ComponentType } from 'react';

import { type SvgIconProps } from '@mui/material';

import {
  SpaceLevel,
  CommunityRoleType,
  AuthorizationPrivilege,
  CommunityMembershipStatus,
} from '../../../../core/apollo/generated/graphql-schema';
import { type Visual } from '../../../../domain/common/visual/Visual';

export type MembershipProps = {
  space: {
    id: string;
    level: SpaceLevel;
    profile: {
      url: string;
      displayName: string;

      avatar?: Visual;
      tagline?: string;
      cardBanner?: Visual;
    };
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
    community?: {
      roleSet: {
        myRoles?: CommunityRoleType[];
        myMembershipStatus?: CommunityMembershipStatus;
      };
    };
  };
  childMemberships?: MembershipProps[];
};

export type MyMembershipsDialogProps = {
  title: string;
  open: boolean;
  loading: boolean;
  data: MembershipProps[];
  onClose: () => void;

  showFooterText?: boolean;
  Icon?: ComponentType<SvgIconProps>;
};
