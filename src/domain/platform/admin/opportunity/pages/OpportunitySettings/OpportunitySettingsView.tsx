import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { Caption } from '@/core/ui/typography';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  refetchAdminSpaceSubspacesPageQuery,
  refetchSpaceDashboardNavigationChallengesQuery,
  refetchSubspacesInSpaceQuery,
  useDeleteSpaceMutation,
  useSpacePrivilegesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import DeleteIcon from '@/domain/journey/space/pages/SpaceSettings/icon/DeleteIcon';
import EntityConfirmDeleteDialog from '@/domain/journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import PageContent from '@/core/ui/content/PageContent';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';

const errorColor = '#940000';

const OpportunitySettingsView = () => {
  const { t } = useTranslation();
  const { subspaceId } = useSubSpace();
  const { spaceNameId, spaceId } = useSpace();
  const notify = useNotification();
  const navigate = useNavigate();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);

  const [deleteOpportunity] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchSubspacesInSpaceQuery({
        spaceId,
      }),
      refetchAdminSpaceSubspacesPageQuery({
        spaceId,
      }),
      refetchSpaceDashboardNavigationChallengesQuery({
        spaceId,
      }),
      'SpaceDashboardNavigationOpportunities',
    ],
    onCompleted: data => {
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success');
      navigate(`/${spaceNameId}`, { replace: true });
    },
  });

  const { data } = useSpacePrivilegesQuery({
    variables: {
      spaceId: subspaceId || spaceId,
    },
    skip: !spaceId && !subspaceId,
  });

  const subspacePriviledges = data?.lookup.space?.authorization?.myPrivileges ?? [];
  const canDelete = subspacePriviledges.includes(AuthorizationPrivilege.Delete);
  const handleDelete = () => {
    return deleteOpportunity({
      variables: {
        input: {
          ID: subspaceId,
        },
      },
    });
  };

  return (
    <PageContent background="transparent">
      {canDelete && (
        <PageContentBlock sx={{ borderColor: errorColor }}>
          <PageContentBlockHeader sx={{ color: errorColor }} title={t('components.deleteEntity.title')} />
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
