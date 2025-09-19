import { useCalloutContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutAllowedContributors,
  CalloutContributionsQuery,
  CalloutContributionsQueryVariables,
  CalloutContributionType,
} from '@/core/apollo/generated/graphql-schema';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Identifiable } from '@/core/utils/Identifiable';
import { Ref, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { CalloutSettingsModelFull } from '../models/CalloutSettingsModel';
import usePaginatedQuery from '@/domain/shared/pagination/usePaginatedQuery';
import useCalloutPostCreatedSubscription from './post/useCalloutPostCreatedSubscription';

const pageSize = 4;
interface CalloutContributionsContainerProps extends SimpleContainerProps<CalloutContributionsContainerProvided> {
  callout:
    | (Identifiable & {
        authorization?: {
          myPrivileges?: AuthorizationPrivilege[];
        };
        settings: {
          contribution: CalloutSettingsModelFull['contribution']; /*
              { //!!
                enabled: boolean;
                allowedTypes: CalloutContributionType[];
                canAddContributions: CalloutAllowedContributors;
                commentsEnabled: boolean;
              };*/
        };
      })
    | undefined;
  contributionType: CalloutContributionType;
  onCalloutUpdate?: () => Promise<unknown> | void;
  skip?: boolean;
}

export interface CalloutContributionsContainerProvided {
  ref: Ref<HTMLDivElement>;
  contributions: {
    items: Required<CalloutContributionsQuery['lookup']>['callout']['contributionsPaginated']['contributions'];
    hasMore: boolean | undefined;
    fetchMore: () => Promise<void>;
    fetchAll: () => Promise<void>;
    total: number;
  };
  contributionsCount: number; //!! provided for legacy, try to remove
  canCreateContribution: boolean;
  subscriptionEnabled: boolean;
  loading?: boolean;
  onCalloutUpdate?: () => Promise<unknown>;
}

const CalloutContributionsContainer = ({
  callout,
  contributionType,
  onCalloutUpdate,
  skip,
  children,
}: CalloutContributionsContainerProps) => {
  const calloutId = callout?.id;

  const { ref: intersectionObserverRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const {
    data,
    loading,
    fetchMore,
    hasMore,
    refetch,
    subscribeToMore,
  } = usePaginatedQuery<CalloutContributionsQuery, CalloutContributionsQueryVariables>({
    useQuery: useCalloutContributionsQuery,
    getPageInfo: data => data.lookup.callout?.contributionsPaginated.pageInfo,
    options: { skip: !inView || !calloutId || skip },
    pageSize,
    variables: {
      calloutId: calloutId!,
      includeLink: contributionType === CalloutContributionType.Link,
      includeWhiteboard: contributionType === CalloutContributionType.Whiteboard,
      includePost: contributionType === CalloutContributionType.Post,

    },
  });

  // TODO: Server#4508 - Enable subscriptions for links and whiteboards
  //!!
  /*const subscription = useCalloutPostCreatedSubscription(data, data => data?.lookup.callout, subscribeToMore, {
    variables: { calloutId: calloutId! },
    skip: !inView || !calloutId || skip || contributionType !== CalloutContributionType.Post,
  });
  */

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

  return (
    <>
      {children({
        ref: intersectionObserverRef,
        contributions: {
          items: data?.lookup.callout?.contributionsPaginated.contributions ?? [],
          hasMore,
          fetchMore,
          fetchAll: fetchMore,  //!!
          total: data?.lookup.callout?.contributionsPaginated.total ?? 0,
        },
        contributionsCount: data?.lookup.callout?.contributionsPaginated.total ?? 0,
        loading,
        canCreateContribution,
        subscriptionEnabled: false, //!! subscription.enabled,
        onCalloutUpdate: async () => {
          await onCalloutUpdate?.();
          await refetch();
        },
      })}
    </>
  );
};

export default CalloutContributionsContainer;
