import { User } from '../../core/apollo/generated/graphql-schema';
import { Author } from '../../domain/shared/components/AuthorAvatar/models/author';
import { buildUserProfileUrl } from './urlBuilders';

interface AuthorData extends Pick<User, 'id' | 'nameID' | 'firstName' | 'lastName'> {
  profile: {
    displayName: string;
    avatar?: {
      uri: string;
    };
    tagsets?: { tags: string[] }[];
    location?: {
      city?: string;
      country?: string;
    };
  };
}

export const buildAuthorFromUser = (user: AuthorData): Author => {
  const avatarURL = user.profile.avatar?.uri;
  const url = buildUserProfileUrl(user.nameID);
  const tags = user?.profile?.tagsets?.flatMap(tagset => tagset.tags);
  const result: Author = {
    id: user.id,
    displayName: user.profile.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: avatarURL,
    url: url,
    tags: tags ?? [],
    city: user.profile.location?.city,
    country: user.profile.location?.country,
  };
  return result;
};
