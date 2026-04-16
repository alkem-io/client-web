import { useTranslation } from 'react-i18next';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutContributions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions';
import { mapCalloutDetailsToDialogData } from '../dataMappers/calloutDataMapper';
import { type ContributionCardData, mapAnyContributionToCardData } from '../dataMappers/contributionDataMapper';
import { CalloutCommentsConnector } from './CalloutCommentsConnector';
import { CalloutPollConnector } from './CalloutPollConnector';
import { ContributionGridConnector } from './ContributionGridConnector';

type CalloutDetailDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailsModelExtended;
};

function getContributionType(callout: CalloutDetailsModelExtended): CalloutContributionType | undefined {
  const allowedTypes = callout.settings.contribution.allowedTypes;
  return allowedTypes.length > 0 ? allowedTypes[0] : undefined;
}

function ContributionsSlot({ callout, open }: { callout: CalloutDetailsModelExtended; open: boolean }) {
  const contributionType = getContributionType(callout);

  const {
    inViewRef,
    contributions: { items },
    loading,
  } = useCalloutContributions({
    callout,
    contributionType: contributionType ?? CalloutContributionType.Post,
    skip: !open || !contributionType || !callout.settings.contribution.enabled,
  });

  if (!contributionType || !callout.settings.contribution.enabled) {
    return null;
  }

  const mapped = items.map(item => mapAnyContributionToCardData(item)).filter(Boolean) as ContributionCardData[];

  return <div ref={inViewRef}>{!loading && <ContributionGridConnector contributions={mapped} />}</div>;
}

export function CalloutDetailDialogConnector({ open, onOpenChange, callout }: CalloutDetailDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const formatDate = (key: string, options?: Record<string, unknown>) => String(t(key as never, options as never));

  const hasPoll = callout.framing.type === CalloutFramingType.Poll;
  const pollSlot = hasPoll ? <CalloutPollConnector callout={callout} /> : undefined;

  const hasContributionType = Boolean(getContributionType(callout)) && callout.settings.contribution.enabled;
  const contributionsSlot = hasContributionType ? <ContributionsSlot callout={callout} open={open} /> : undefined;

  if (!callout.comments?.id) {
    return (
      <CalloutDetailDialog
        open={open}
        onOpenChange={onOpenChange}
        callout={mapCalloutDetailsToDialogData(callout, formatDate)}
        commentsSlot={<p className="text-sm text-muted-foreground">{t('comments.empty')}</p>}
        pollSlot={pollSlot}
        hasContributions={hasContributionType}
        contributionsSlot={contributionsSlot}
        contributionsCount={callout.contributions.length}
      />
    );
  }

  return (
    <CalloutCommentsConnector roomId={callout.comments.id} calloutId={callout.id} roomData={callout.comments}>
      {({ thread, commentInput, commentCount }) => (
        <CalloutDetailDialog
          open={open}
          onOpenChange={onOpenChange}
          callout={{
            ...mapCalloutDetailsToDialogData(callout, formatDate),
            commentCount,
          }}
          commentsSlot={thread}
          commentInputSlot={commentInput}
          hasContributions={hasContributionType}
          contributionsSlot={contributionsSlot}
          contributionsCount={callout.contributions.length}
          pollSlot={pollSlot}
        />
      )}
    </CalloutCommentsConnector>
  );
}
