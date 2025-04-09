import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export type SpaceAboutLightModel = {
  authorization?: {
    id: string;
    myPrivileges?: AuthorizationPrivilege[] | undefined;
  };
  isContentPublic?: boolean;
  membership?: {
    myMembershipStatus?: string;
    roleSetID?: string;
    communityID?: string;
  };
  guidelines?: {
    id: string;
  };
  profile: {
    displayName: string;
    tagline?: string;
    url: string;
    description?: string;
    tagset?: {
      tags: string[];
    };
    avatar?: {
      uri: string;
      alternativeText?: string;
    };
    cardBanner?: {
      uri: string;
      alternativeText?: string;
    };
    banner?: {
      uri: string;
      alternativeText?: string;
    };
  };
};
