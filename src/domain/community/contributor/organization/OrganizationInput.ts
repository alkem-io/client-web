import { Tagset } from '@/domain/common/profile/Profile';
import { OrganizationVerificationEnum, Reference } from '@/core/apollo/generated/graphql-schema';
import { Location } from '@/domain/common/location/Location';

export interface OrganizationInput {
  name: string | undefined;
  nameID: string;
  description: string | undefined;
  tagline: string | undefined;
  location: Location;
  tagsets: Tagset[];
  contactEmail: string | undefined;
  domain: string | undefined;
  legalEntityName: string | undefined;
  website: string | undefined;
  verified: OrganizationVerificationEnum;
  references: Reference[];
}
