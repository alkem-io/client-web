import { Reference, Tagset } from '@/domain/common/profile/Profile';

export interface GroupFormInput {
  name: string;
  tagsets: Tagset[];
  references: Reference[];
  description: string;
  profileId: string;
}
