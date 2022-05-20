import { Tagset } from '../../models/Profile';
import { OrganizationVerificationEnum, Reference } from '../../models/graphql-schema';
import { Location } from '../location/Location';

export interface OrganizationInput {
  name: string;
  nameID: string;
  description: string;
  location: Location;
  tagsets: Tagset[];
  contactEmail: string;
  domain: string;
  legalEntityName: string;
  website: string;
  verified: OrganizationVerificationEnum;
  references: Reference[];
}
