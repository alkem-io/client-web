import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { CrdPostContributionDialog } from '@/main/crdPages/post/CrdPostContributionDialog';

// `open` + `onOpenChange` form a discriminated pair: pass both (controlled) or neither
// (uncontrolled). Passing only one would compile but leave the dialog inert in one direction.
type ControlledOpen = { open: boolean; onOpenChange: (open: boolean) => void };
type UncontrolledOpen = { open?: undefined; onOpenChange?: undefined };

type PostContributionAddConnectorProps = {
  calloutId: string;
  defaultDisplayName?: string;
  defaultDescription?: string;
  onCreated?: () => void;
  /** When true, suppresses the in-grid trigger card; a parent renders its own trigger and controls `open`. */
  inlineTrigger?: boolean;
} & (ControlledOpen | UncontrolledOpen);

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
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

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
