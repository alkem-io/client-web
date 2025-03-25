import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, useTheme } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { Caption } from '@/core/ui/typography';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useDeleteSpaceMutation, useSpacePrivilegesQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import DeleteIcon from '@/domain/journey/space/pages/SpaceSettings/icon/DeleteIcon';
import EntityConfirmDeleteDialog from '@/domain/shared/components/EntityConfirmDeleteDialog';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import PageContent from '@/core/ui/content/PageContent';
import { useSpace } from '@/domain/space/context/useSpace';

const OpportunitySettingsView = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { subspace } = useSubSpace();
  const { space } = useSpace();
  const spaceId = space?.id;
  const subspaceId = subspace?.id;
  const notify = useNotification();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);

  const [deleteOpportunity] = useDeleteSpaceMutation({
    onCompleted: () => {
      notify(t('pages.admin.space.notifications.space-removed'), 'success');
      window.location.replace(space.about.profile.url);
    },
  });

  const { data } = useSpacePrivilegesQuery({
    variables: {
      spaceId: subspaceId || spaceId,
    },
    skip: !spaceId && !subspaceId,
  });

  const subspacePrivileges = data?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = subspacePrivileges.includes(AuthorizationPrivilege.Delete);
  const handleDelete = () => {
    return deleteOpportunity({
      variables: {
        spaceId: subspaceId,
      },
    });
  };

  return (
    <PageContent background="transparent">
      {canDelete && (
        <PageContentBlock sx={{ borderColor: theme.palette.error.main }}>
          <PageContentBlockHeader sx={{ color: theme.palette.error.main }} title={t('components.deleteEntity.title')} />
          <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
            <DeleteIcon />
            <Caption>{t('components.deleteEntity.description', { entity: t('common.subspace') })}</Caption>
          </Box>
        </PageContentBlock>
      )}
      {openDeleteDialog && (
        <EntityConfirmDeleteDialog
          entity={'Subspace'}
          open={openDeleteDialog}
          onClose={closeDialog}
          onDelete={handleDelete}
        />
      )}
    </PageContent>
  );
};

export default OpportunitySettingsView;
