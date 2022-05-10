import { Tagset } from '../../../models/Profile';
import { OrganizationVerificationEnum, Reference } from '../../../models/graphql-schema';
import { Location as LocationModel } from '../../../models/Location';

export type OrganizationModel = {
  name: string;
  nameID: string;
  description: string;
  location: LocationModel;
  tagsets: Tagset[];
  contactEmail: string;
  domain: string;
  legalEntityName: string;
  website: string;
  verified: OrganizationVerificationEnum;
  references: Reference[];
};
