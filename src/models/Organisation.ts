import { Tagset, Reference } from './Profile';

export interface OrganisationModel {
  displayName: string;
  description: string;
  avatar: string;
  tagsets: Tagset[];
  references: Reference[];
}
