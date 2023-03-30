import { ReactNode, useCallback } from 'react';
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
  communityReadAccess: boolean | undefined;
  sendMessageToCommunityLeads: (message: string) => Promise<void>;
  metrics: MetricsItemFragment[] | undefined;
  privilegesLoading: boolean;
  authorized: boolean | undefined;
  vision: string | undefined;
  background: string | undefined;
  who: string | undefined;
  loading: boolean;
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

  const { data: journeyPrivilegesQueryData, loading: privilegesLoading } = useJourneyPrivilegesQuery({
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

  const { data: journeyCommunityPrivilegesQueryData, loading: journeyCommunityPrivilegesLoading } =
    useJourneyCommunityPrivilegesQuery({
      variables: {
        hubNameId,
        challengeNameId,
        opportunityNameId,
        includeHub: journeyTypeName === 'hub',
        includeChallenge: journeyTypeName === 'challenge',
        includeOpportunity: journeyTypeName === 'opportunity',
      },
      skip: privilegesLoading || isAuthorized,
    });

  const { authorization: communityAuthorization } =
    journeyCommunityPrivilegesQueryData?.hub.opportunity?.community ??
    journeyCommunityPrivilegesQueryData?.hub.challenge?.community ??
    journeyCommunityPrivilegesQueryData?.hub.community ??
    {};

  const communityReadAccess = communityAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const { data: journeyDataQueryData } = useJourneyDataQuery({
    variables: {
      hubNameId,
      challengeNameId,
      opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
      includeCommunity: communityReadAccess,
    },
    skip: privilegesLoading || isAuthorized || journeyCommunityPrivilegesLoading,
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

  const provided: JourneyUnauthorizedDialogContainerProvided = {
    authorized: isAuthorized,
    privilegesLoading,
    communityReadAccess,
    background: profile?.description,
    displayName: profile?.displayName,
    tagline: profile?.tagline,
    vision: context?.vision,
    who: context?.who,
    metrics,
    sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
    leadOrganizations: community?.leadOrganizations,
    leadUsers: community?.leadUsers,
    loading: privilegesLoading,
  };

  return <>{children(provided)}</>;
};

export default JourneyUnauthorizedDialogContainer;
