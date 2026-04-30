import type { ComponentType, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { useCalloutContributionsCountQuery, useCalloutContributionsQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { gutters } from '@/core/ui/grid/utils';
import type { CalloutRestrictions } from '../callout/CalloutRestrictionsTypes';
import type { CalloutDetailsModelExtended } from '../callout/models/CalloutDetailsModel';
import type { CalloutContributionCreateButtonProps } from './interfaces/CalloutContributionCreateButtonProps';
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

  // Collabora documents have no dedicated `contributionsCount.collaboraDocument`
  // field on the server, so for that type we derive the count from the contributions
  // list itself. Apollo will dedupe with the inner list's identical query.
  const isCollaboraType = contributionType === CalloutContributionType.CollaboraDocument;

  const {
    data: countData,
    loading: loadingCount,
    refetch: refetchCount,
  } = useCalloutContributionsCountQuery({
    variables: {
      calloutId: callout.id,
      includeLink: contributionType === CalloutContributionType.Link,
      includeMemo: contributionType === CalloutContributionType.Memo,
      includePost: contributionType === CalloutContributionType.Post,
      includeWhiteboard: contributionType === CalloutContributionType.Whiteboard,
    },
    skip: !callout.id || !inView || isCollaboraType,
  });

  const {
    data: collaboraData,
    loading: loadingCollabora,
    refetch: refetchCollabora,
  } = useCalloutContributionsQuery({
    variables: {
      calloutId: callout.id,
      includeLink: false,
      includeMemo: false,
      includePost: false,
      includeWhiteboard: false,
      includeCollaboraDocument: true,
      limit: undefined,
    },
    skip: !callout.id || !inView || !isCollaboraType,
  });

  const contributionsCount = isCollaboraType
    ? (collaboraData?.lookup.callout?.contributions.length ?? 0)
    : (countData?.lookup.callout?.contributionsCount.link ?? 0) +
      (countData?.lookup.callout?.contributionsCount.memo ?? 0) +
      (countData?.lookup.callout?.contributionsCount.post ?? 0) +
      (countData?.lookup.callout?.contributionsCount.whiteboard ?? 0);

  const refetch = isCollaboraType ? refetchCollabora : refetchCount;
  const loading = loadingCallout || (isCollaboraType ? loadingCollabora : loadingCount);

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
