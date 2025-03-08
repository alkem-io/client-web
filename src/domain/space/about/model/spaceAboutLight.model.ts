import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export type SpaceAboutLightModel = {
  id: string;
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
    };
    cardBanner?: {
      uri: string;
    };
  };
};
