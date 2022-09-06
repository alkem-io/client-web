import { useCallback, useMemo } from 'react';
import { Author } from '../../models/discussion/author';
import { buildUserProfileUrl } from '../../common/utils/urlBuilders';
import { useAuthorDetailsQuery } from '../../hooks/generated/graphql';
import { uniq } from 'lodash';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { User } from '../../models/graphql-schema';
import { useChallenge, useHub, useOpportunity, useUserCardRoleName } from '../../hooks';

export const useAuthorsDetails = (authorIds: string[]) => {
  const uniqIds = uniq(authorIds).sort();

  const { data: authorData, loading } = useAuthorDetailsQuery({
    variables: { ids: uniqIds },
    skip: uniqIds.length === 0,
  });
  const { hubId } = useHub();
  const { challengeId } = useChallenge();
  const { opportunityId } = useOpportunity();

  const resourceId = opportunityId || challengeId || hubId || '';

  const usersWithRoles = useUserCardRoleName((authorData?.usersById || []) as User[], resourceId);

  const authors = useMemo(
    () =>
      authorData?.usersById.map<Author>(a => ({
        id: a.id,
        displayName: a.displayName,
        firstName: a.firstName,
        lastName: a.lastName,
        avatarUrl: a.profile?.avatar?.uri || '',
        url: buildUserProfileUrl(a.nameID),
        tags: a.profile?.tagsets?.flatMap(x => x.tags),
        city: a.profile?.location?.city,
        country: COUNTRIES_BY_CODE[a.profile?.location?.country || ''],
        roleName: usersWithRoles.find(u => u.id === a.id)?.roleName,
      })),
    [authorData]
  );

  const getAuthor = useCallback((id: string) => authors?.find(a => a.id === id), [authors]);

  const getAuthors = useCallback((ids: string[]) => authors?.filter(a => ids.includes(a.id)), [authors]);

  return {
    authors,
    getAuthor,
    getAuthors,
    loading,
  };
};
