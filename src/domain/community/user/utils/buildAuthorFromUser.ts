import { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import { Identifiable } from '@/core/utils/Identifiable';
import { ProfileType } from '@/core/apollo/generated/graphql-schema';

export interface AuthorData extends Identifiable {
  firstName?: string;
  lastName?: string;
  profile: {
    displayName: string;
    url: string;
    type?: ProfileType;
    avatar?: {
      uri: string;
    };
    visual?: {
      uri: string;
    };
    tagsets?: { tags: string[] }[];
    location?: {
      city?: string;
      country?: string;
    };
  };
}

export const buildAuthorFromUser = (user: AuthorData): AuthorModel => {
  const avatarUrl = user.profile.avatar ? user.profile.avatar?.uri : user.profile.visual?.uri;
  const tags = user?.profile?.tagsets?.flatMap(tagset => tagset.tags);
  const firstName = user.firstName ?? user.profile.displayName.split(' ')[0];
  const lastName = user.lastName ?? user.profile.displayName.split(' ')[1];
  const result: AuthorModel = {
    id: user.id,
    firstName,
    lastName,
    displayName: user.profile.displayName,
    avatarUrl,
    url: user.profile.url,
    tags: tags ?? [],
    city: user.profile.location?.city,
    country: user.profile.location?.country,
    type: user.profile.type,
  };
  return result;
};
