import { ProfileType } from '@/core/apollo/generated/graphql-schema';

export interface AuthorModel {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
  url: string;
  tags?: string[];
  city?: string;
  country?: string;
  type?: ProfileType;
}
