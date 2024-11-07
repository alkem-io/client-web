import { ReactNode, useCallback } from 'react';
import {
  useJourneyCommunityPrivilegesQuery,
  useJourneyDataQuery,
  useSendMessageToCommunityLeadsMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
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
  canReadSpace: boolean | undefined;
  loading: boolean;
  children: (provided: JourneyUnauthorizedDialogContainerProvided) => ReactNode;
}

const fetchCommunityPrivileges = mainQuery(useJourneyCommunityPrivilegesQuery);
const fetchJourneyData = mainQuery(useJourneyDataQuery);

const JourneyUnauthorizedDialogContainer = ({
  journeyId,
  canReadSpace = true,
  loading = false,
  children,
}: JourneyUnauthorizedDialogContainerProps) => {
  const isUnauthorized = !canReadSpace && !loading;

  const {
    data: journeyCommunityPrivilegesQueryData,
    loading: journeyCommunityPrivilegesLoading,
    error: journeyCommunityPrivilegesError,
  } = fetchCommunityPrivileges({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId || !isUnauthorized,
  });

  const communityReadAccess =
    journeyCommunityPrivilegesQueryData?.lookup.space?.community?.authorization?.myPrivileges?.includes(
      AuthorizationPrivilege.Read
    );

  const { data: journeyDataQueryData, error: journeyDataError } = fetchJourneyData({
    variables: {
      spaceId: journeyId!,
      includeCommunity: Boolean(communityReadAccess), // passing undefined triggers Apollo Invariant Violation error
    },
    skip:
      !journeyId || !isUnauthorized || journeyCommunityPrivilegesLoading || Boolean(journeyCommunityPrivilegesError),
  });

  const { profile, context, metrics, community } = journeyDataQueryData?.lookup.space ?? {};

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
    authorized: !isUnauthorized,
    background: profile?.description,
    displayName: profile?.displayName,
    tagline: profile?.tagline,
    references: profile?.references,
    vision: context?.vision,
    who: context?.who,
    impact: context?.impact,
    metrics,
    sendMessageToCommunityLeads: handleSendMessageToCommunityLeads,
    provider: journeyDataQueryData?.lookup.space?.provider,
    leadOrganizations: community?.roleSet.leadOrganizations,
    leadUsers: community?.roleSet.leadUsers,
    loading,
    error: journeyCommunityPrivilegesError ?? journeyDataError,
  };

  return <>{children(provided)}</>;
};

export default JourneyUnauthorizedDialogContainer;
