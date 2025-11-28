import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

// Extended to include lead users and organizations for card display
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
    leadUsers?: Array<{
      id: string;
      profile: {
        id: string;
        url: string;
        displayName: string;
        avatar?: {
          uri: string;
          alternativeText?: string;
        };
      };
    }>;
    leadOrganizations?: Array<{
      id: string;
      profile: {
        id: string;
        url: string;
        displayName: string;
        avatar?: {
          uri: string;
          alternativeText?: string;
        };
      };
    }>;
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
