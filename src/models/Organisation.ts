import { Tagset, Reference } from './Profile';

export interface OrganisationModel {
  name: string;
  description: string;
  avatar: string;
  tagsets: Tagset[];
  references: Reference[];
}
