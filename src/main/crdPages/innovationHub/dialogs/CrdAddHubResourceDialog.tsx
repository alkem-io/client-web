import { useTranslation } from 'react-i18next';
import { useAccountResourcesInfoQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AddHubResourceDialog,
  type AddHubResourceDialogLabels,
  type HubResourceCandidate,
} from '@/crd/components/innovationHub/AddHubResourceDialog';
import type { HubResourceType } from '@/domain/innovationHub/InnovationHubsSettings/useResolveHubResourceUrl';
import { AddHubResourceByUrlForm } from './AddHubResourceByUrlForm';

// Literal-key records keep `t()` fully typed per resource type.
const TYPE_KEYS = {
  space: {
    title: 'settings.addResourceDialog.space.title',
    description: 'settings.addResourceDialog.space.description',
    candidatesEmpty: 'settings.addResourceDialog.space.candidatesEmpty',
    candidatesAria: 'settings.addResourceDialog.space.candidatesAria',
  },
  pack: {
    title: 'settings.addResourceDialog.pack.title',
    description: 'settings.addResourceDialog.pack.description',
    candidatesEmpty: 'settings.addResourceDialog.pack.candidatesEmpty',
    candidatesAria: 'settings.addResourceDialog.pack.candidatesAria',
  },
  virtualContributor: {
    title: 'settings.addResourceDialog.virtualContributor.title',
    description: 'settings.addResourceDialog.virtualContributor.description',
    candidatesEmpty: 'settings.addResourceDialog.virtualContributor.candidatesEmpty',
    candidatesAria: 'settings.addResourceDialog.virtualContributor.candidatesAria',
  },
} as const;

export type CrdAddHubResourceDialogProps = {
  open: boolean;
  onClose: () => void;
  resourceType: HubResourceType;
  /** The hub's owning account — scope of the candidates tab (the URL tab accepts any account, FR-019). */
  accountId: string;
  /** ids already on the hub's curated list of this type — candidates are deduplicated against it. */
  existingIds: string[];
  /** Appends the resource to the curated list (the tab-data hooks' `add`). */
  onAdd: (id: string) => Promise<void>;
  /** True while the underlying update mutation is in flight. */
  busy: boolean;
};

/**
 * Integration wrapper of the uniform two-tab "Add …" dialog (FR-016/FR-017):
 * fetches the hub account's resources of the requested type as candidates
 * (deduplicated against the curated list — spec edge case "duplicate adds")
 * and slots in the add-by-URL form. Used by all three settings tabs; for
 * Spaces it replaces the former URL-only `CrdAddSpaceByUrlDialog` (FR-016).
 */
export const CrdAddHubResourceDialog = ({
  open,
  onClose,
  resourceType,
  accountId,
  existingIds,
  onAdd,
  busy,
}: CrdAddHubResourceDialogProps) => {
  const { t } = useTranslation('crd-innovationHub');

  const { data, loading: candidatesLoading } = useAccountResourcesInfoQuery({
    variables: { accountId },
    skip: !open || !accountId,
  });
  const account = data?.lookup.account;

  const candidates: HubResourceCandidate[] = (() => {
    if (!account) return [];
    if (resourceType === 'space') {
      return (account.spaces ?? [])
        .filter(space => !existingIds.includes(space.id))
        .map(space => ({
          id: space.id,
          displayName: space.about.profile.displayName,
          description: space.about.profile.tagline || undefined,
          avatarUrl: space.about.profile.avatar?.uri || space.about.profile.cardBanner?.uri || undefined,
        }));
    }
    if (resourceType === 'pack') {
      return (account.innovationPacks ?? [])
        .filter(pack => !existingIds.includes(pack.id))
        .map(pack => ({
          id: pack.id,
          displayName: pack.profile.displayName,
          description: pack.profile.tagline || undefined,
          avatarUrl: pack.profile.avatar?.uri || undefined,
        }));
    }
    return (
      (account.virtualContributors ?? [])
        // Profile-less VCs are dropped (consistent with mapAccountHostedResources) —
        // a candidate card without a display name would render blank.
        .filter(vc => vc.profile && !existingIds.includes(vc.id))
        .map(vc => ({
          id: vc.id,
          displayName: vc.profile?.displayName ?? '',
          description: vc.profile?.tagline || undefined,
          avatarUrl: vc.profile?.avatar?.uri || undefined,
        }))
    );
  })();

  const labels: AddHubResourceDialogLabels = {
    title: t(TYPE_KEYS[resourceType].title),
    description: t(TYPE_KEYS[resourceType].description),
    candidatesTab: t('settings.addResourceDialog.candidatesTab'),
    urlTab: t('settings.addResourceDialog.urlTab'),
    candidatesEmpty: t(TYPE_KEYS[resourceType].candidatesEmpty),
    candidatesLoading: t('settings.addResourceDialog.candidatesLoading'),
    candidatesAria: t(TYPE_KEYS[resourceType].candidatesAria),
    addToHub: t('settings.addResourceDialog.addToHub'),
    close: t('settings.addResourceDialog.close'),
  };

  return (
    <AddHubResourceDialog
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
      labels={labels}
      candidates={candidates}
      candidatesLoading={candidatesLoading}
      onAddCandidate={id => void onAdd(id)}
      busy={busy}
      urlTabSlot={
        <AddHubResourceByUrlForm
          resourceType={resourceType}
          existingIds={existingIds}
          onAdd={onAdd}
          onAdded={onClose}
        />
      }
    />
  );
};
