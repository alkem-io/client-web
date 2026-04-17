import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import useCalloutCollaborationPermissions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutCollaborationPermissions';
import useCalloutContributions from '@/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions';
import { getCalloutContributionType, mapCalloutDetailsToDialogData } from '../dataMappers/calloutDataMapper';
import { type ContributionCardData, mapAnyContributionToCardData } from '../dataMappers/contributionDataMapper';
import { CalloutCommentsConnector } from './CalloutCommentsConnector';
import { CalloutPollConnector } from './CalloutPollConnector';
import { ContributionGridConnector } from './ContributionGridConnector';

import { WhiteboardContributionAddConnector } from './WhiteboardContributionAddConnector';

import { WhiteboardContributionConnector } from './WhiteboardContributionConnector';
import { WhiteboardFramingConnector } from './WhiteboardFramingConnector';

type CalloutDetailDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailsModelExtended;
  /** If set, the whiteboard dialog opens immediately on top of the callout dialog */
  initialWhiteboardContributionId?: string;
};

function ContributionsSlot({
  callout,
  open,
  onContributionClick,
  onContributionCreated,
}: {
  callout: CalloutDetailsModelExtended;
  open: boolean;
  onContributionClick?: (id: string) => void;
  onContributionCreated?: () => void;
}) {
  const contributionType = getCalloutContributionType(callout);
  const { canCreateContribution } = useCalloutCollaborationPermissions({
    callout,
    contributionType: contributionType ?? CalloutContributionType.Post,
  });

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

  const trailingSlot =
    canCreateContribution && contributionType === CalloutContributionType.Whiteboard ? (
      <WhiteboardContributionAddConnector calloutId={callout.id} onCreated={onContributionCreated} />
    ) : null;

  return (
    <div ref={inViewRef}>
      {!loading && (
        <ContributionGridConnector
          contributions={mapped}
          onContributionClick={onContributionClick}
          trailingSlot={trailingSlot}
        />
      )}
    </div>
  );
}

export function CalloutDetailDialogConnector({
  open,
  onOpenChange,
  callout,
  initialWhiteboardContributionId,
}: CalloutDetailDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const formatDate = (key: string, options?: Record<string, unknown>) => String(t(key as never, options as never));
  const [whiteboardContributionId, setWhiteboardContributionId] = useState<string | undefined>(
    initialWhiteboardContributionId
  );

  // Sync when the parent passes a new initial contribution ID (e.g. feed thumbnail click)
  useEffect(() => {
    if (initialWhiteboardContributionId) {
      setWhiteboardContributionId(initialWhiteboardContributionId);
    }
  }, [initialWhiteboardContributionId]);

  const hasPoll = callout.framing.type === CalloutFramingType.Poll;
  const pollSlot = hasPoll ? <CalloutPollConnector callout={callout} /> : undefined;

  const hasWhiteboardFraming = callout.framing.type === CalloutFramingType.Whiteboard && !!callout.framing.whiteboard;
  const whiteboardFramingSlot = hasWhiteboardFraming ? <WhiteboardFramingConnector callout={callout} /> : undefined;

  const handleContributionClick = (contributionId: string) => {
    setWhiteboardContributionId(contributionId);
  };

  const hasContributionType = Boolean(getCalloutContributionType(callout)) && callout.settings.contribution.enabled;
  const contributionsSlot = hasContributionType ? (
    <ContributionsSlot callout={callout} open={open} onContributionClick={handleContributionClick} />
  ) : undefined;

  const whiteboardOverlay = whiteboardContributionId ? (
    <WhiteboardContributionConnector
      open={true}
      calloutId={callout.id}
      contributionId={whiteboardContributionId}
      onClose={() => setWhiteboardContributionId(undefined)}
    />
  ) : null;

  if (!callout.comments?.id) {
    return (
      <>
        <CalloutDetailDialog
          open={open}
          onOpenChange={onOpenChange}
          callout={mapCalloutDetailsToDialogData(callout, formatDate)}
          commentsSlot={<p className="text-sm text-muted-foreground">{t('comments.empty')}</p>}
          pollSlot={pollSlot}
          whiteboardFramingSlot={whiteboardFramingSlot}
          hasContributions={hasContributionType}
          contributionsSlot={contributionsSlot}
          contributionsCount={callout.contributions.length}
        />
        {whiteboardOverlay}
      </>
    );
  }

  return (
    <>
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
            whiteboardFramingSlot={whiteboardFramingSlot}
          />
        )}
      </CalloutCommentsConnector>
      {whiteboardOverlay}
    </>
  );
}
