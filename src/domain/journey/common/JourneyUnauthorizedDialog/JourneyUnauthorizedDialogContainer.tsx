import { ReactNode, useCallback, useMemo } from 'react';
import {
  useJourneyCommunityPrivilegesQuery,
  useJourneyDataQuery,
  useJourneyPrivilegesQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityDashboardLeads } from '../../../community/community/EntityDashboardContributorsSection/Types';
import {
  AuthorizationPrivilege,
  MetricsItemFragment,
  Reference,
} from '../../../../core/apollo/generated/graphql-schema';
import mainQuery from '../../../../core/apollo/utils/mainQuery';

interface JourneyUnauthorizedDialogContainerProvided extends EntityDashboardLeads {
  displayName: string | undefined;
  tagline: string | undefined;
  references: Reference[] | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  metrics: MetricsItemFragment[] | undefined;
  authorized: boolean | undefined;
  vision: string | undefined;
  background: string | undefined;
  who: string | undefined;
  impact: string | undefined;
  loading: boolean;
  error: Error | undefined;
}

interface JourneyUnauthorizedDialogContainerProps {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
  loading?: boolean;
  children: (provided: JourneyUnauthorizedDialogContainerProvided) => ReactNode;
}

const fetchPrivileges = mainQuery(useJourneyPrivilegesQuery);
const fetchCommunityPrivileges = mainQuery(useJourneyCommunityPrivilegesQuery);
const fetchJourneyData = mainQuery(useJourneyDataQuery);

const JourneyUnauthorizedDialogContainer = ({
  journeyId,
  journeyTypeName,
  loading = false,
  children,
}: JourneyUnauthorizedDialogContainerProps) => {
  const {
    data: journeyPrivilegesQueryData,
    loading: privilegesLoading,
    error: privilegesError,
  } = fetchPrivileges({
    variables: {
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: !journeyId,
  });

  const { authorization } =
    journeyPrivilegesQueryData?.lookup.subsubspace ??
    journeyPrivilegesQueryData?.lookup.subspace ??
    journeyPrivilegesQueryData?.space ??
    {};

  const isAuthorized = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const shouldSkipJourneyCommunityPrivileges = privilegesLoading || Boolean(privilegesError) || isAuthorized;

  const {
    data: journeyCommunityPrivilegesQueryData,
    loading: journeyCommunityPrivilegesLoading,
    error: journeyCommunityPrivilegesError,
  } = fetchCommunityPrivileges({
    variables: {
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: shouldSkipJourneyCommunityPrivileges || !journeyId,
  });

  const { authorization: communityAuthorization } =
    journeyCommunityPrivilegesQueryData?.lookup.subsubspace?.community ??
    journeyCommunityPrivilegesQueryData?.lookup.subspace?.community ??
    journeyCommunityPrivilegesQueryData?.space?.community ??
    {};

  const communityReadAccess = communityAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const { data: journeyDataQueryData, error: journeyDataError } = fetchJourneyData({
    variables: {
      spaceId: journeyId,
      challengeId: journeyId,
      opportunityId: journeyId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
      includeCommunity: communityReadAccess,
    },
    skip:
      !journeyId ||
      shouldSkipJourneyCommunityPrivileges ||
      journeyCommunityPrivilegesLoading ||
      Boolean(journeyCommunityPrivilegesError),
  });

  const { profile, context, metrics, community } =
    journeyDataQueryData?.lookup.subsubspace ??
    journeyDataQueryData?.lookup.subspace ??
    journeyDataQueryData?.space ??
    {};

  const [sendMessageToCommunityLeads] = useSendMessageToCommunityLeadsMutation();
  const handleSendMessageToCommunityLeads = useCallback(
    async (messageText: string) => {
      await sendMessageToCommunityLeads({
        variables: {
          messageData: {
            message: messageText,
            communityId: community?.id!,
          },
        },
      });
    },
    [sendMessageToCommunityLeads, community]
  );

  const hostOrganizations = useMemo(
    () => journeyDataQueryData?.space?.account.host && [journeyDataQueryData?.space.account.host],
    [journeyDataQueryData]
  );

  const provided: JourneyUnauthorizedDialogContainerProvided = {
    authorized: isAuthorized,
    background: profile?.description,
    displayName: profile?.displayName,
    tagline: profile?.tagline,
    references: profile?.references,
    vision: context?.vision,
    who: context?.who,
    impact: context?.impact,
    metrics,
    sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
    hostOrganizations: journeyTypeName === 'space' ? hostOrganizations : undefined,
    leadOrganizations: community?.leadOrganizations,
    leadUsers: community?.leadUsers,
    loading: privilegesLoading || loading,
    error: privilegesError ?? journeyCommunityPrivilegesError ?? journeyDataError,
  };

  return <>{children(provided)}</>;
};

export default JourneyUnauthorizedDialogContainer;
