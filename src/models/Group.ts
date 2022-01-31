import { Reference, Tagset } from './Profile';

export interface GroupFormGenerated {
  name: string;
  tagsets: Tagset[];
  references: Reference[];
  description: string;
  profileId: string;
}
