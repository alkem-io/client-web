import { useCallback, useMemo } from 'react';
import { Author } from '../../models/discussion/author';
import { buildUserProfileUrl } from '../../common/utils/urlBuilders';
import { useAuthorDetailsQuery } from '../../hooks/generated/graphql';
import { uniq } from 'lodash';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { useChallenge, useHub, useOpportunity, WithCredentials } from '../../hooks';
import { useTranslation } from 'react-i18next';
import {
  MessageAuthorRoleNameKey,
  HOST_TRANSLATION_KEY,
  LEAD_TRANSLATION_KEY,
} from '../../models/constants/translation.constants';

type ResourceTypeName = 'hub' | 'challenge' | 'opportunity';

function findRoleNameKey(
  user: WithCredentials,
  resourceType: ResourceTypeName,
  resourceId: string
): MessageAuthorRoleNameKey | undefined {
  switch (resourceType) {
    case 'hub': {
      if (
        user.agent?.credentials?.find(c => c.resourceID === resourceId && c.type === AuthorizationCredential.HubHost)
      ) {
        return HOST_TRANSLATION_KEY;
      }
      break;
    }
    case 'challenge': {
      if (
        user.agent?.credentials?.find(
          c => c.resourceID === resourceId && c.type === AuthorizationCredential.ChallengeLead
        )
      ) {
        return LEAD_TRANSLATION_KEY;
      }
      break;
    }
    case 'opportunity': {
      if (
        user.agent?.credentials?.find(
          c => c.resourceID === resourceId && c.type === AuthorizationCredential.OpportunityLead
        )
      ) {
        return LEAD_TRANSLATION_KEY;
      }
      break;
    }
  }
}

export const useAuthorsDetails = (authorIds: string[]) => {
  const { t } = useTranslation();
  const uniqIds = uniq(authorIds).sort();

  const { data: authorData, loading } = useAuthorDetailsQuery({
    variables: { ids: uniqIds },
    skip: uniqIds.length === 0,
  });
  const { hubId } = useHub();
  const { challengeId } = useChallenge();
  const { opportunityId } = useOpportunity();

  const resourceId = opportunityId || challengeId || hubId || '';
  const resourceType: ResourceTypeName = opportunityId ? 'opportunity' : challengeId ? 'challenge' : 'hub';

  const authors = useMemo(
    () =>
      authorData?.usersById.map<Author>(author => {
        const roleNameKey = findRoleNameKey(author, resourceType, resourceId);
        const roleName = roleNameKey ? t(roleNameKey) : '';
        return {
          id: author.id,
          displayName: author.displayName,
          firstName: author.firstName,
          lastName: author.lastName,
          avatarUrl: author.profile?.avatar?.uri || '',
          url: buildUserProfileUrl(author.nameID),
          tags: author.profile?.tagsets?.flatMap(x => x.tags),
          city: author.profile?.location?.city,
          country: COUNTRIES_BY_CODE[author.profile?.location?.country || ''],
          roleName: roleName,
        };
      }),
    [authorData, resourceId]
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
