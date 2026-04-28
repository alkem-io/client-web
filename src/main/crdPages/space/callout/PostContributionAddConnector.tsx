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
};

export function PostContributionAddConnector({
  calloutId,
  defaultDisplayName,
  defaultDescription,
  onCreated,
}: PostContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [open, setOpen] = useState(false);

  return (
    <>
      <ContributionAddCard label={t('callout.addPost')} icon={MessageSquare} onClick={() => setOpen(true)} />
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
