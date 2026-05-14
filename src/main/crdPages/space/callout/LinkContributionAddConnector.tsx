import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateLinkOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import {
  LinkContributionDialog,
  type LinkContributionFormValues,
} from '@/crd/components/contribution/LinkContributionDialog';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

type LinkContributionAddConnectorProps = {
  calloutId: string;
  onCreated?: () => void;
  /** When true, renders a small inline "+ Add link" button instead of the full add card.
   *  Used by the list-view feed branch where the Add affordance lives inside `ContributionLinkList`. */
  inlineTrigger?: boolean;
  /** Controlled-open hook for the inline-trigger case: lets a parent open this connector's dialog. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function LinkContributionAddConnector({
  calloutId,
  onCreated,
  inlineTrigger,
  open: controlledOpen,
  onOpenChange,
}: LinkContributionAddConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [createLink] = useCreateLinkOnCalloutMutation({
    refetchQueries: ['CalloutDetails', 'CalloutContributions'],
    awaitRefetchQueries: true,
  });

  const [handleSubmit, saving] = useLoadingState(async (values: LinkContributionFormValues) => {
    await createLink({
      variables: {
        calloutId,
        link: {
          uri: values.url,
          profile: {
            displayName: values.displayName,
            description: values.description || undefined,
          },
        },
      },
    });
    setOpen(false);
    onCreated?.();
  });

  return (
    <>
      {!inlineTrigger && (
        <ContributionAddCard label={t('callout.addLink')} icon={Link2} onClick={() => setOpen(true)} />
      )}
      <LinkContributionDialog
        open={open}
        onOpenChange={open => {
          if (!saving) setOpen(open);
        }}
        mode="create"
        saving={saving}
        onSubmit={handleSubmit}
      />
    </>
  );
}
