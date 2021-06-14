import { Reference, Tagset } from './Profile';

export interface GroupFormGenerated {
  name: string;
  avatar: string;
  tagsets: Tagset[];
  references: Reference[];
  description: string;
  profileId: string;
}
