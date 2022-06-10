import { Tagset } from '../../models/Profile';
import { OrganizationVerificationEnum, Reference } from '../../models/graphql-schema';
import { Location } from '../location/Location';

export interface OrganizationInput {
  name: string | undefined;
  nameID: string;
  description: string | undefined;
  location: Location;
  tagsets: Tagset[];
  contactEmail: string | undefined;
  domain: string | undefined;
  legalEntityName: string | undefined;
  website: string | undefined;
  verified: OrganizationVerificationEnum;
  references: Reference[];
}

export interface CreateOrganizationInput {
  name: string | undefined;
  nameID: string;
  description: string | undefined;
  location: Location;
  tagsets: Tagset[];
  contactEmail: string | undefined;
  domain: string | undefined;
  legalEntityName: string | undefined;
  website: string | undefined;
  verified: OrganizationVerificationEnum;
  references: Reference[];
}
