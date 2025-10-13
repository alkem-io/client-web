import { useCalloutContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutAllowedContributors,
  CalloutContributionsQuery,
  CalloutContributionType,
} from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import { Ref, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { CalloutSettingsModelFull } from '../../callout/models/CalloutSettingsModel';
import useCalloutPostCreatedSubscription from '../post/useCalloutPostCreatedSubscription';
import { sortBy } from 'lodash';

interface useCalloutContributionsProps {
  callout:
    | (Identifiable & {
        authorization?: {
          myPrivileges?: AuthorizationPrivilege[];
        };
        settings: {
          contribution: CalloutSettingsModelFull['contribution'];
        };
      })
    | undefined;
  pageSize?: number;
  contributionType: CalloutContributionType;
  onCalloutUpdate?: () => Promise<unknown> | void;
  skip?: boolean;
}

export interface useCalloutContributionsProvided {
  /**
   * Ref to be set in a div that will be observed for intersection to trigger the query
   * avoids fetching the contributions until the user scrolls to the callout
   *
   * TROUBLESHOOT:
   *   If you are seeing that your contributions don't load, make sure that you are using the ref provided in some visible component
   */
  inViewRef: Ref<HTMLDivElement>;

  /**
   * Provides the contributions paginated
   */
  contributions: {
    items: Required<CalloutContributionsQuery['lookup']>['callout']['contributions'];
    // Provide the children to decide if they want to fetch all contributions or the first page only
    hasMore: boolean;
    setFetchAll: (fetchAllContributions: boolean) => void;
    total: number;
  };

  canCreateContribution: boolean;
  subscriptionEnabled: boolean;
  loading?: boolean;

  /**
   * just bubbles up for a callout refetch
   */
  onCalloutContributionsUpdate: () => Promise<unknown>;
}

const useCalloutContributions = ({
  callout,
  contributionType,
  onCalloutUpdate,
  pageSize,
  skip,
}: useCalloutContributionsProps): useCalloutContributionsProvided => {
  const { ref: inViewRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  // This component does some kind of pagination. Fetches the first $limit contributions and the total number of them
  // A child of this container may want to fetch all contributions in a use effect or on user interaction, calling the provided fetchAll function
  // changes this state to `true` and once changed to true, it never goes back to false
  // if no pageSize provided, fetch all from the start
  const [fetchAllEnabled, setFetchAllEnabled] = useState(!pageSize);
  const [returnAllResults, setReturnAllResult] = useState(false);
  const handleSetFetchAll = (fetchAll: boolean) => {
    if (fetchAll) {
      setFetchAllEnabled(true);
      setReturnAllResult(true);
    } else {
      setReturnAllResult(false);
    }
  };

  const { data, previousData, loading, refetch, subscribeToMore } = useCalloutContributionsQuery({
    variables: {
      calloutId: callout?.id!,
      includeLink: contributionType === CalloutContributionType.Link,
      includeWhiteboard: contributionType === CalloutContributionType.Whiteboard,
      includePost: contributionType === CalloutContributionType.Post,
      limit: fetchAllEnabled ? undefined : pageSize,
    },
    skip: !inView || !callout?.id || skip,
    fetchPolicy: 'cache-and-network', // Always check network for updates
    nextFetchPolicy: 'cache-first', // But subsequent fetches can use cache
  });

  const subscription = useCalloutPostCreatedSubscription(data, data => data?.lookup.callout, subscribeToMore, {
    variables: { calloutId: callout?.id! },
    skip: !inView || !callout?.id || skip || contributionType !== CalloutContributionType.Post,
  });

  const canCreateContribution = useMemo(() => {
    if (
      !callout ||
      !callout.settings.contribution.enabled ||
      callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.None)
    ) {
      return false;
    }

    const calloutPrivileges = callout.authorization?.myPrivileges ?? [];
    const requiredPrivileges = [AuthorizationPrivilege.Contribute];

    if (callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Admins)) {
      requiredPrivileges.push(AuthorizationPrivilege.Update);
    }

    switch (contributionType) {
      case CalloutContributionType.Whiteboard:
        requiredPrivileges.push(AuthorizationPrivilege.CreateWhiteboard);
        break;
      case CalloutContributionType.Post:
        requiredPrivileges.push(AuthorizationPrivilege.CreatePost);
        break;
    }

    return requiredPrivileges.every(privilege => calloutPrivileges.includes(privilege));
  }, [callout, callout?.settings, callout?.authorization, contributionType]);

  // Use previousData while loading to avoid losing already shown items when the expanded query fires
  const effectiveData = useMemo(() => {
    if (loading) {
      return previousData ?? data;
    }
    return data;
  }, [loading, data, previousData]);

  const items = useMemo(() => {
    const sortedContributions = sortBy(effectiveData?.lookup.callout?.contributions ?? [], 'sortOrder');
    if (returnAllResults) {
      return sortedContributions;
    } else {
      return sortedContributions.slice(0, pageSize);
    }
  }, [effectiveData, returnAllResults, pageSize]);

  const totalContributionsCount =
    (() => {
      switch (contributionType) {
        case CalloutContributionType.Link:
          return (effectiveData ?? data)?.lookup.callout?.contributionsCount.link;
        case CalloutContributionType.Whiteboard:
          return (effectiveData ?? data)?.lookup.callout?.contributionsCount.whiteboard;
        case CalloutContributionType.Post:
          return (effectiveData ?? data)?.lookup.callout?.contributionsCount.post;
      }
    })() ?? 0;

  return {
    inViewRef,
    contributions: {
      items,
      hasMore: (effectiveData?.lookup.callout?.contributions.length ?? 0) < totalContributionsCount,
      setFetchAll: handleSetFetchAll,
      total: totalContributionsCount,
    },
    loading,
    canCreateContribution,
    subscriptionEnabled: subscription.enabled,
    onCalloutContributionsUpdate: async () => {
      await onCalloutUpdate?.();
      await refetch();
    },
  };
};

export default useCalloutContributions;
