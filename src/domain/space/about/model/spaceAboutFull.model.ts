import { AuthorizationPrivilege, TagsetType } from '@/core/apollo/generated/graphql-schema';

export type ContributorModel = {
  id: string;
  profile: {
    id: string;
    displayName: string;
    url: string;
    tagline?: string;
    description?: string;
    avatar?: {
      id;
      uri;
    };
    location?: {
      city?: string;
      country?: string;
    };
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
    visuals: {
      id: string;
      uri: string;
      name: string;
      alternativeText?: string;
      // TODO: these should not be part of the basic About model type
      allowedTypes: string[];
      aspectRatio: number;
      maxHeight: number;
      maxWidth: number;
      minHeight: number;
      minWidth: number;
    }[];
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
