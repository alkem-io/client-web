import { Author } from '../../../shared/components/AuthorAvatar/models/author';
import { Identifiable } from '../../../../core/utils/Identifiable';

interface AuthorData extends Identifiable {
  firstName: string;
  lastName: string;
  profile: {
    displayName: string;
    url: string;
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

export const buildAuthorFromUser = (user: AuthorData): Author => {
  const avatarURL = user.profile.avatar ? user.profile.avatar?.uri : user.profile.visual?.uri;
  const tags = user?.profile?.tagsets?.flatMap(tagset => tagset.tags);
  const result: Author = {
    id: user.id,
    displayName: user.profile.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: avatarURL,
    url: user.profile.url,
    tags: tags ?? [],
    city: user.profile.location?.city,
    country: user.profile.location?.country,
  };
  return result;
};
