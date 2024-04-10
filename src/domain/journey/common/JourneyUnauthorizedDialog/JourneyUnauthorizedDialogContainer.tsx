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
      spaceId: journeyId!,
    },
    skip: !journeyId,
  });

  const { authorization } = journeyPrivilegesQueryData?.space ?? {};

  const isAuthorized = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read);

  const shouldSkipJourneyCommunityPrivileges = privilegesLoading || Boolean(privilegesError) || isAuthorized;

  const {
    // data: journeyCommunityPrivilegesQueryData,
    loading: journeyCommunityPrivilegesLoading,
    error: journeyCommunityPrivilegesError,
  } = fetchCommunityPrivileges({
    variables: {
      spaceId: journeyId!,
    },
    skip: shouldSkipJourneyCommunityPrivileges || !journeyId,
  });

  // const { authorization: communityAuthorization } = journeyCommunityPrivilegesQueryData?.space?.community ?? {};

  const { data: journeyDataQueryData, error: journeyDataError } = fetchJourneyData({
    variables: {
      spaceId: journeyId!,
    },
    skip:
      !journeyId ||
      shouldSkipJourneyCommunityPrivileges ||
      journeyCommunityPrivilegesLoading ||
      Boolean(journeyCommunityPrivilegesError),
  });

  const { profile, context, metrics, community } = journeyDataQueryData?.space ?? {};

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
