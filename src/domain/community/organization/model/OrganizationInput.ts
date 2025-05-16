import { OrganizationVerificationEnum, Reference } from '@/core/apollo/generated/graphql-schema';
import { LocationModel } from '@/domain/common/location/LocationModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface OrganizationInput {
  name: string | undefined;
  nameID: string;
  description: string | undefined;
  tagline: string | undefined;
  location: LocationModel;
  tagsets: TagsetModel[];
  contactEmail: string | undefined;
  domain: string | undefined;
  legalEntityName: string | undefined;
  website: string | undefined;
  verified: OrganizationVerificationEnum;
  references: Reference[];
}
