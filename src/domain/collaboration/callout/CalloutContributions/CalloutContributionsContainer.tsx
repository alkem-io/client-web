import { useCalloutContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import { Identifiable } from '@/core/utils/Identifiable';
import { useInView } from 'react-intersection-observer';
import { CalloutSettingsModelFull } from '../../new-callout/models/CalloutSettingsModel';
import { Ref } from 'react';
import { CalloutContributionsQuery, CalloutContributionType } from '@/core/apollo/generated/graphql-schema';

interface CalloutContributionsContainerProps extends SimpleContainerProps<CalloutContributionsContainerProvided> {
  callout:
    | (Identifiable & {
        settings: {
          contribution: CalloutSettingsModelFull['contribution'];
        };
      })
    | undefined;
  onCalloutUpdate?: () => Promise<unknown>;
  skip?: boolean;
}

interface CalloutContributionsContainerProvided {
  ref: Ref<HTMLDivElement>;
  contributions: Required<CalloutContributionsQuery['lookup']>['callout']['contributions'];
  loading;
  onCalloutUpdate?: () => Promise<unknown>;
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

  return (
    <>
      {children({
        ref: intersectionObserverRef,
        contributions: data?.lookup.callout?.contributions ?? [],
        loading,
        onCalloutUpdate: async () => {
          await onCalloutUpdate?.();
          await refetch();
        },
      })}
    </>
  );
};

export default CalloutContributionsContainer;
