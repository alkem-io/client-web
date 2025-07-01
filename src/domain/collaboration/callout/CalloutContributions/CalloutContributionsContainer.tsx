import { useCalloutContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutAllowedContributors,
  CalloutContributionsQuery,
  CalloutContributionType,
} from '@/core/apollo/generated/graphql-schema';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Identifiable } from '@/core/utils/Identifiable';
import { Ref, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { CalloutSettingsModelFull } from '../../new-callout/models/CalloutSettingsModel';

interface CalloutContributionsContainerProps extends SimpleContainerProps<CalloutContributionsContainerProvided> {
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
  contributionType: CalloutContributionType;
  onCalloutUpdate?: () => Promise<unknown> | void;
  skip?: boolean;
}

interface CalloutContributionsContainerProvided {
  ref: Ref<HTMLDivElement>;
  contributions: Required<CalloutContributionsQuery['lookup']>['callout']['contributions'];
  contributionsCount: number;
  canCreateContribution: boolean;
  loading;
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

  const { data, loading, refetch } = useCalloutContributionsQuery({
    variables: {
      calloutId: calloutId!,
      includeLink: contributionType === CalloutContributionType.Link,
      includeWhiteboard: contributionType === CalloutContributionType.Whiteboard,
      includePost: contributionType === CalloutContributionType.Post,
    },
    skip: !inView || !calloutId || skip,
  });

  const canCreateContribution = useMemo(() => {
    if (!callout || !callout.settings.contribution.enabled) {
      return false;
    }
    const calloutPrivileges = callout?.authorization?.myPrivileges ?? [];
    const requiredPrivileges = [AuthorizationPrivilege.Contribute];
    switch (contributionType) {
      case CalloutContributionType.Whiteboard:
        requiredPrivileges.push(AuthorizationPrivilege.CreateWhiteboard);
        break;
      case CalloutContributionType.Post:
        requiredPrivileges.push(AuthorizationPrivilege.CreatePost);
        break;
    }
    const hasPermissions = requiredPrivileges.every(privilege => calloutPrivileges.includes(privilege));
    if (hasPermissions) {
      return true;
    }
    if (callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Admins)) {
      return calloutPrivileges.includes(AuthorizationPrivilege.Update);
    }
    return false;
  }, [callout, callout?.settings, callout?.authorization, contributionType]);

  return (
    <>
      {children({
        ref: intersectionObserverRef,
        contributions: data?.lookup.callout?.contributions ?? [],
        contributionsCount: data?.lookup.callout?.contributions.length ?? 0,
        loading,
        canCreateContribution,
        onCalloutUpdate: async () => {
          await onCalloutUpdate?.();
          await refetch();
        },
      })}
    </>
  );
};

export default CalloutContributionsContainer;
