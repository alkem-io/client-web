import { ReactNode, useCallback, useMemo } from 'react';
import {
  useJourneyCommunityPrivilegesQuery,
  useJourneyDataQuery,
  useJourneyPrivilegesQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../JourneyTypeName';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { EntityDashboardLeads } from '../../../community/community/EntityDashboardContributorsSection/Types';
import { AuthorizationPrivilege, MetricsItemFragment } from '../../../../core/apollo/generated/graphql-schema';

interface JourneyUnauthorizedDialogContainerProvided extends EntityDashboardLeads {
  displayName: string | undefined;
  tagline: string | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  metrics: MetricsItemFragment[] | undefined;
  privilegesLoading: boolean;
  authorized: boolean | undefined;
  vision: string | undefined;
  background: string | undefined;
  who: string | undefined;
  impact: string | undefined;
  loading: boolean;
  error: Error | undefined;
}

interface JourneyUnauthorizedDialogContainerProps {
  journeyTypeName: JourneyTypeName;
  children: (provided: JourneyUnauthorizedDialogContainerProvided) => ReactNode;
}

const JourneyUnauthorizedDialogContainer = ({ journeyTypeName, children }: JourneyUnauthorizedDialogContainerProps) => {
  // TODO move to Page components, pass from there
  const { hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!hubNameId) {
    throw new Error('Must be within a Hub route.');
  }

  const {
    data: journeyPrivilegesQueryData,
    loading: privilegesLoading,
    error: privilegesError,
  } = useJourneyPrivilegesQuery({
    variables: {
      hubNameId,
      challengeNameId,
      opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
  });

  const { authorization } =
    journeyPrivilegesQueryData?.hub.opportunity ??
    journeyPrivilegesQueryData?.hub.challenge ??
    journeyPrivilegesQueryData?.hub ??
    {};

  const isAuthorized = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const shouldSkipJourneyCommunityPrivileges = privilegesLoading || Boolean(privilegesError) || isAuthorized;

  const {
    data: journeyCommunityPrivilegesQueryData,
    loading: journeyCommunityPrivilegesLoading,
    error: journeyCommunityPrivilegesError,
  } = useJourneyCommunityPrivilegesQuery({
    variables: {
      hubNameId,
      challengeNameId,
      opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: shouldSkipJourneyCommunityPrivileges,
  });

  const { authorization: communityAuthorization } =
    journeyCommunityPrivilegesQueryData?.hub.opportunity?.community ??
    journeyCommunityPrivilegesQueryData?.hub.challenge?.community ??
    journeyCommunityPrivilegesQueryData?.hub.community ??
    {};

  const communityReadAccess = communityAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const { data: journeyDataQueryData, error: journeyDataError } = useJourneyDataQuery({
    variables: {
      hubNameId,
      challengeNameId,
      opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
      includeCommunity: communityReadAccess,
    },
    skip:
      shouldSkipJourneyCommunityPrivileges ||
      journeyCommunityPrivilegesLoading ||
      Boolean(journeyCommunityPrivilegesError),
  });

  const { profile, context, metrics, community } =
    journeyDataQueryData?.hub.opportunity ?? journeyDataQueryData?.hub.challenge ?? journeyDataQueryData?.hub ?? {};

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
    () => journeyDataQueryData?.hub.host && [journeyDataQueryData?.hub.host],
    [journeyDataQueryData]
  );

  const provided: JourneyUnauthorizedDialogContainerProvided = {
    authorized: isAuthorized,
    privilegesLoading,
    background: profile?.description,
    displayName: profile?.displayName,
    tagline: profile?.tagline,
    vision: context?.vision,
    who: context?.who,
    impact: context?.impact,
    metrics,
    sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
    leadOrganizations: journeyTypeName === 'hub' ? hostOrganizations : community?.leadOrganizations,
    leadUsers: community?.leadUsers,
    loading: privilegesLoading,
    error: privilegesError ?? journeyCommunityPrivilegesError ?? journeyDataError,
  };

  return <>{children(provided)}</>;
};

export default JourneyUnauthorizedDialogContainer;
