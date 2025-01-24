import { useCallback, useMemo } from 'react';
import { Author } from '@/domain/shared/components/AuthorAvatar/models/author';
import { useAuthorDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { uniq } from 'lodash';
import { COUNTRIES_BY_CODE } from '@/domain/common/location/countries.constants';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';

export const useAuthorsDetails = (authorIds: string[]) => {
  const uniqIds = uniq(authorIds).sort();

  const { isAuthenticated } = useAuthenticationContext();
  const { data: authorData, loading } = useAuthorDetailsQuery({
    variables: { ids: uniqIds },
    skip: uniqIds.length === 0 || !isAuthenticated,
  });

  const authors = useMemo(
    () =>
      authorData?.users.map<Author>(author => {
        return {
          id: author.id,
          displayName: author.profile.displayName,
          firstName: author.firstName,
          lastName: author.lastName,
          avatarUrl: author.profile.visual?.uri || '',
          url: author.profile.url,
          tags: author.profile.tagsets?.flatMap(x => x.tags),
          city: author.profile.location?.city,
          country: COUNTRIES_BY_CODE[author.profile.location?.country || ''],
        };
      }),
    [authorData]
  );

  const getAuthor = useCallback(
    (id?: string) => (typeof id === 'undefined' ? undefined : authors?.find(a => a.id === id)),
    [authors]
  );

  const getAuthors = useCallback((ids: string[]) => authors?.filter(a => ids.includes(a.id)), [authors]);

  return {
    authors,
    getAuthor,
    getAuthors,
    loading,
  };
};
