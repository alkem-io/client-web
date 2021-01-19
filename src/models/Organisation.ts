import { Tagset, Reference } from './User';

export interface OrganisationModel {
  name: string;
  description: string;
  avatar: string;
  tagsets: Tagset[];
  references: Reference[];
}
