import { useCalloutContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutAllowedContributors,
  CalloutContributionsQuery,
  CalloutContributionType,
} from '@/core/apollo/generated/graphql-schema';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Identifiable } from '@/core/utils/Identifiable';
import { Ref } from 'react';
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
  onCalloutUpdate?: () => Promise<unknown> | void;
  skip?: boolean;
}

interface CalloutContributionsContainerProvided {
  ref: Ref<HTMLDivElement>;
  contributions: Required<CalloutContributionsQuery['lookup']>['callout']['contributions'];
  contributionsCount: number;
  canCreateContribution: boolean;
  loading;
  refetchContributions?: () => Promise<unknown>;
}

const CalloutContributionsContainer = ({
  callout,
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
      includeLink: callout?.settings.contribution.allowedTypes.includes(CalloutContributionType.Link) ?? false,
      includeWhiteboard:
        callout?.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard) ?? false,
      includePost: callout?.settings.contribution.allowedTypes.includes(CalloutContributionType.Post) ?? false,
    },
    skip: !inView || !calloutId || skip,
  });

  const canCreateContribution =
    (callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.CreatePost) &&
      callout.settings.contribution.enabled &&
      callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Post) &&
      ((callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Admins) &&
        callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update)) ||
        callout.settings.contribution.canAddContributions.includes(CalloutAllowedContributors.Members))) ??
    false;

  return (
    <>
      {children({
        ref: intersectionObserverRef,
        contributions: data?.lookup.callout?.contributions ?? [],
        contributionsCount: data?.lookup.callout?.contributions.length ?? 0,
        loading,
        canCreateContribution,
        refetchContributions: async () => {
          await onCalloutUpdate?.();
          await refetch();
        },
      })}
    </>
  );
};

export default CalloutContributionsContainer;
