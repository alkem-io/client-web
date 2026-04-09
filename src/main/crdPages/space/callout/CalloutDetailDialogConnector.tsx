import { useTranslation } from 'react-i18next';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { mapCalloutDetailsToDialogData } from '../dataMappers/calloutDataMapper';
import { CalloutCommentsConnector } from './CalloutCommentsConnector';

type CalloutDetailDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailsModelExtended;
};

export function CalloutDetailDialogConnector({ open, onOpenChange, callout }: CalloutDetailDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const formatDate = (key: string, options?: Record<string, unknown>) => String(t(key as never, options as never));

  if (!callout.comments?.id) {
    return (
      <CalloutDetailDialog
        open={open}
        onOpenChange={onOpenChange}
        callout={mapCalloutDetailsToDialogData(callout, formatDate)}
        commentsSlot={<p className="text-sm text-muted-foreground">{t('comments.empty')}</p>}
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
          hasContributions={false}
        />
      )}
    </CalloutCommentsConnector>
  );
}
