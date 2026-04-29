import { useTranslation } from 'react-i18next';
import { ShareDialog } from '@/crd/components/common/ShareDialog';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { CalloutShareOnAlkemioForm } from './CalloutShareOnAlkemioForm';

type CalloutShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callout: CalloutDetailsModelExtended;
};

/**
 * Mounting site for the Share flow on a callout. Wraps the CRD `ShareDialog`
 * with the Alkemio user-picker slot (`CalloutShareOnAlkemioForm`) pre-wired.
 *
 * Lives at the connector layer so multiple Share triggers (3-dots menu, detail
 * dialog header, reactions bar) can share a single open state instead of each
 * mounting their own dialog instance.
 */
export function CalloutShareDialog({ open, onOpenChange, callout }: CalloutShareDialogProps) {
  const { t } = useTranslation();
  const url = callout.framing.profile.url;
  return (
    <ShareDialog
      open={open}
      onOpenChange={onOpenChange}
      url={url}
      // Key by `url` so the form remounts (and seeds `message` from the new
      // default) if a different callout is ever shown through the same dialog
      // instance — local message/selectedUsers state would otherwise go stale.
      shareOnAlkemioSlot={<CalloutShareOnAlkemioForm key={url} url={url} entityLabel={t('common.callout')} />}
    />
  );
}
