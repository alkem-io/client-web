import { Author } from '../../domain/shared/components/AuthorAvatar/models/author';
import { buildUserProfileUrl } from './urlBuilders';

export const buildAuthorFromUser = (user: any): Author => {
  const avatarURL = user.profile.avatar.uri;
  const url = buildUserProfileUrl(user.nameID);
  const tags: string[] = [];
  for (const tagset of user.profile.tagsets) {
    tags.push(tagset.tags);
  }
  const result: Author = {
    id: user.id,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: avatarURL,
    url: url,
    tags: tags,
    city: user.profile.location.city,
    country: user.profile.location.country,
  };
  return result;
};
