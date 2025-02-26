import { AuthorizationPrivilege, TagsetType } from '@/core/apollo/generated/graphql-schema';

export type SpaceAboutDetailsModel = {
  id: string;
  who?: string;
  why?: string;
  authorization?: {
    id: string;
    myPrivileges?: AuthorizationPrivilege[] | undefined;
  };
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
