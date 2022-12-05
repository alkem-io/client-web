import { useCallback, useMemo } from 'react';
import { Author } from '../../shared/components/AuthorAvatar/models/author';
import { buildUserProfileUrl } from '../../../common/utils/urlBuilders';
import { useAuthorDetailsQuery } from '../../../core/apollo/generated/apollo-hooks';
import { uniq } from 'lodash';
import { COUNTRIES_BY_CODE } from '../../common/location/countries.constants';
import { AuthorizationCredential } from '../../../core/apollo/generated/graphql-schema';
import { WithCredentials } from '../../community/contributor/user/hooks/useUserCardRoleName';
import { useHub } from '../../challenge/hub/HubContext/useHub';
import { useChallenge } from '../../challenge/challenge/hooks/useChallenge';
import { useOpportunity } from '../../challenge/opportunity/hooks/useOpportunity';
import { useTranslation } from 'react-i18next';
import {
  MessageAuthorRoleNameKey,
  HOST_TRANSLATION_KEY,
  LEAD_TRANSLATION_KEY,
} from '../../community/contributor/user/constants/translation.constants';

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
    [authorData, resourceId, resourceType, t]
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
