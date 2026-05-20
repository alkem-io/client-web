import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { CrdPostContributionDialog } from '@/main/crdPages/post/CrdPostContributionDialog';

type PostContributionAddConnectorProps = {
  calloutId: string;
  defaultDisplayName?: string;
  defaultDescription?: string;
  onCreated?: () => void;
  /** When true, suppresses the in-grid trigger card; a parent renders its own trigger and controls `open`. */
  inlineTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function PostContributionAddConnector({
  calloutId,
  defaultDisplayName,
  defaultDescription,
  onCreated,
  inlineTrigger,
  open: controlledOpen,
  onOpenChange,
}: PostContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <>
      {!inlineTrigger && (
        <ContributionAddCard label={t('callout.addPost')} icon={MessageSquare} onClick={() => setOpen(true)} />
      )}
      {open && (
        <CrdPostContributionDialog
          open={open}
          onOpenChange={setOpen}
          mode="create"
          calloutId={calloutId}
          defaultDisplayName={defaultDisplayName}
          defaultDescription={defaultDescription}
          onCreated={() => {
            onCreated?.();
          }}
        />
      )}
    </>
  );
}
