import { Reference, Tagset } from '../../../../../common/profile/Profile';

export interface GroupFormInput {
  name: string;
  tagsets: Tagset[];
  references: Reference[];
  description: string;
  profileId: string;
}
