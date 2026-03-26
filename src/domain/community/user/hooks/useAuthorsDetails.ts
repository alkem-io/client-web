import { uniq } from 'lodash-es';
import { useUsersModelFullQuery } from '@/core/apollo/generated/apollo-hooks';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { COUNTRIES_BY_CODE } from '@/domain/common/location/countries.constants';
import type { AuthorModel } from '@/domain/community/user/models/AuthorModel';

export const useAuthorsDetails = (authorIds: string[]) => {
  const uniqIds = uniq(authorIds).sort();

  const { isAuthenticated } = useAuthenticationContext();
  const { data: authorData, loading } = useUsersModelFullQuery({
    variables: { ids: uniqIds },
    skip: uniqIds.length === 0 || !isAuthenticated,
  });

  const authors = authorData?.users.map<AuthorModel>(author => {
    return {
      id: author.id,
      displayName: author.profile?.displayName ?? '',
      firstName: author.firstName,
      lastName: author.lastName,
      avatarUrl: author.profile?.avatar?.uri ?? '',
      url: author.profile?.url ?? '',
      tags: author.profile?.tagsets?.flatMap(x => x.tags),
      city: author.profile?.location?.city,
      country: COUNTRIES_BY_CODE[author.profile?.location?.country || ''],
    };
  });

  const getAuthor = (id?: string) => (typeof id === 'undefined' ? undefined : authors?.find(a => a.id === id));

  const getAuthors = (ids: string[]) => authors?.filter(a => ids.includes(a.id));

  return {
    authors,
    getAuthor,
    getAuthors,
    loading,
  };
};
