import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateWingbackAccountMutation,
  useDeleteInnovationHubMutation,
  useDeleteInnovationPackMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useEnsurePresence from '@/core/utils/ensurePresence';

export enum AccountEntityType {
  Space = 'Space',
  VirtualContributor = 'VirtualContributor',
  InnovationPack = 'InnovationPack',
  InnovationHub = 'InnovationHub',
}

export const useAccountEntityDeletion = (accountId: string | undefined) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const ensurePresence = useEnsurePresence();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [entity, setSelectedEntity] = useState<AccountEntityType | undefined>(undefined);

  const clearDeleteState = () => {
    setDeleteDialogOpen(false);
    setSelectedEntity(undefined);
    setSelectedId(undefined);
  };

  const [deleteSpace, { loading: deleteSpaceLoading }] = useDeleteSpaceMutation({
    onCompleted: () => {
      clearDeleteState();
      notify(t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.space') }), 'success');
    },
    onError: () => {
      clearDeleteState();
      notify(t('pages.admin.generic.sections.account.deleteFailed', { entity: t('common.space') }), 'error');
    },
    refetchQueries: ['AccountInformation'],
  });

  const [deleteVCMutation, { loading: deleteVCLoading }] = useDeleteVirtualContributorOnAccountMutation({
    onCompleted: () => {
      clearDeleteState();
      notify(
        t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.virtualContributor') }),
        'success'
      );
    },
    onError: () => {
      clearDeleteState();
      notify(
        t('pages.admin.generic.sections.account.deleteFailed', { entity: t('common.virtualContributor') }),
        'error'
      );
    },
    refetchQueries: ['AccountInformation'],
  });

  const [deletePackMutation, { loading: deletePackLoading }] = useDeleteInnovationPackMutation({
    onCompleted: () => {
      clearDeleteState();
      notify(
        t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.innovationPack') }),
        'success'
      );
    },
    onError: () => {
      clearDeleteState();
      notify(t('pages.admin.generic.sections.account.deleteFailed', { entity: t('common.innovationPack') }), 'error');
    },
    refetchQueries: ['AccountInformation'],
  });

  const [deleteHubMutation, { loading: deleteHubLoading }] = useDeleteInnovationHubMutation({
    onCompleted: () => {
      clearDeleteState();
      notify(
        t('pages.admin.generic.sections.account.deletedSuccessfully', { entity: t('common.innovation-hub') }),
        'success'
      );
    },
    onError: () => {
      clearDeleteState();
      notify(t('pages.admin.generic.sections.account.deleteFailed', { entity: t('common.innovation-hub') }), 'error');
    },
    refetchQueries: ['AccountInformation'],
  });

  const [createWingbackAccount, { loading: isWingbackCreating }] = useCreateWingbackAccountMutation({
    onCompleted: () => {
      notify(t('pages.admin.generic.sections.account.externalSubAdded'), 'success');
    },
    onError: () => {
      notify(t('pages.admin.generic.sections.account.externalSubErrored'), 'error');
    },
    refetchQueries: ['AccountInformation'],
  });

  const openDeleteDialog = (entityType: AccountEntityType, id: string) => {
    setSelectedEntity(entityType);
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const deleteEntity = () => {
    switch (entity) {
      case AccountEntityType.Space: {
        const requiredSpaceId = ensurePresence(selectedId, 'SpaceId');
        return deleteSpace({ variables: { spaceId: requiredSpaceId } });
      }
      case AccountEntityType.VirtualContributor:
        if (!selectedId) return;
        return deleteVCMutation({ variables: { virtualContributorData: { ID: selectedId } } });
      case AccountEntityType.InnovationPack:
        if (!selectedId) return;
        return deletePackMutation({ variables: { innovationPackId: selectedId } });
      case AccountEntityType.InnovationHub:
        if (!selectedId) return;
        return deleteHubMutation({ variables: { innovationHubId: selectedId } });
    }
  };

  const onCreateWingbackAccount = () => {
    if (!accountId) return;
    createWingbackAccount({ variables: { accountID: accountId } });
  };

  const getEntityName = (entityType: AccountEntityType | undefined) => {
    switch (entityType) {
      case AccountEntityType.VirtualContributor:
        return t('common.virtualContributor');
      case AccountEntityType.InnovationPack:
        return t('common.innovationPack');
      case AccountEntityType.InnovationHub:
        return t('common.innovation-hub');
      default:
        return t('common.space');
    }
  };

  return {
    deleteDialogOpen,
    entity,
    clearDeleteState,
    openDeleteDialog,
    deleteEntity,
    getEntityName,
    deleteSpaceLoading,
    deleteVCLoading,
    deletePackLoading,
    deleteHubLoading,
    isWingbackCreating,
    onCreateWingbackAccount,
  };
};
