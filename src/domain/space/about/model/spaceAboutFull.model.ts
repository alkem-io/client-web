import { AuthorizationPrivilege, ProfileType, TagsetType } from '@/core/apollo/generated/graphql-schema';

export type ContributorModel = {
  id: string;
  profile: {
    id: string;
    displayName: string;
    url: string;
    tagline?: string;
    description?: string;
    avatar?: {
      id: string;
      uri: string;
    };
    location?: {
      city?: string;
      country?: string;
    };
    type?: ProfileType;
  };
};
export type SpaceAboutFullModel = {
  id: string;
  who?: string;
  why?: string;
  authorization?: {
    id: string;
    myPrivileges?: AuthorizationPrivilege[] | undefined;
  };
  isContentPublic: boolean;
  membership: {
    myMembershipStatus?: string;
    roleSetID?: string;
    communityID?: string;
    leadUsers?: ContributorModel[];
    leadOrganizations?: ContributorModel[];
  };
  guidelines: {
    id: string;
  };
  metrics?: {
    name: string;
    value: string;
  }[];
  provider?: ContributorModel;
  profile: {
    id: string;
    url: string;
    displayName: string;
    tagline?: string;
    description?: string;
    tagset?: {
      id: string;
      name: string;
      tags: string[];
      // TODO: these should not be part of the basic About model type
      allowedValues: string[];
      type: TagsetType;
    };
    avatar?: {
      id: string;
      uri: string;
      alternativeText?: string;
    };
    cardBanner?: {
      id: string;
      uri: string;
      alternativeText?: string;
    };
    banner?: {
      id: string;
      uri: string;
      alternativeText?: string;
    };
    references?: {
      id: string;
      name: string;
      uri: string;
      description?: string;
    }[];
    location?: {
      id: string;
      city?: string;
      country?: string;
    };
  };
};
