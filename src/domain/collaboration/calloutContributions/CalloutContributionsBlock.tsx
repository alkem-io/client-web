import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { ComponentType, PropsWithChildren } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { CalloutContributionCreateButtonProps } from './interfaces/CalloutContributionCreateButtonProps';
import { CalloutDetailsModelExtended } from '../callout/models/CalloutDetailsModel';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import { CalloutRestrictions } from '../callout/CalloutRestrictionsTypes';
import { useCalloutContributionsCountQuery } from '@/core/apollo/generated/apollo-hooks';
import { useInView } from 'react-intersection-observer';
import useCalloutCollaborationPermissions from './useCalloutContributions/useCalloutCollaborationPermissions';

interface CalloutContributionsBlockProps extends PropsWithChildren {
  callout: CalloutDetailsModelExtended;
  createContributionButtonComponent?: ComponentType<CalloutContributionCreateButtonProps>;
  calloutRestrictions?: CalloutRestrictions;
  contributionType: CalloutContributionType;
  loadingCallout?: boolean;
  onCalloutContributionsUpdate?: () => Promise<unknown>;
}

const CalloutContributionsBlock = ({
  callout,
  createContributionButtonComponent: CreateContributionButton,
  calloutRestrictions,
  loadingCallout,
  contributionType,
  onCalloutContributionsUpdate,
  children,
}: CalloutContributionsBlockProps) => {
  const { t } = useTranslation();

  const { ref: inViewRef, inView } = useInView({
    delay: 500,
    trackVisibility: true,
    triggerOnce: true,
  });

  const { canCreateContribution } = useCalloutCollaborationPermissions({ callout, contributionType });

  const {
    data,
    loading: loadingContributions,
    refetch,
  } = useCalloutContributionsCountQuery({
    variables: {
      calloutId: callout.id,
      includeLink: contributionType === CalloutContributionType.Link,
      includeMemo: contributionType === CalloutContributionType.Memo,
      includePost: contributionType === CalloutContributionType.Post,
      includeWhiteboard: contributionType === CalloutContributionType.Whiteboard,
    },
    skip: !callout.id || !inView,
  });

  const contributionsCount =
    (data?.lookup.callout?.contributionsCount.link ?? 0) +
    (data?.lookup.callout?.contributionsCount.memo ?? 0) +
    (data?.lookup.callout?.contributionsCount.post ?? 0) +
    (data?.lookup.callout?.contributionsCount.whiteboard ?? 0);

  const loading = loadingCallout || loadingContributions;

  return (
    <PageContentBlock sx={{ margin: gutters(1), width: 'auto' }} ref={inViewRef}>
      <PageContentBlockHeader title={t('callout.contributions.contributions', { count: contributionsCount ?? 0 })}>
        {!loading && CreateContributionButton && (
          <CreateContributionButton
            callout={callout}
            canCreateContribution={canCreateContribution}
            onContributionCreated={async () => {
              await refetch();
              await onCalloutContributionsUpdate?.();
            }}
            calloutRestrictions={calloutRestrictions}
          />
        )}
      </PageContentBlockHeader>
      {children}
    </PageContentBlock>
  );
};

export default CalloutContributionsBlock;
