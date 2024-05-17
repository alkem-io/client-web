import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import PageContentBlock from '../../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../../core/ui/content/PageContentBlockHeader';
import { Caption } from '../../../../../../core/ui/typography';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import {
  refetchSpaceDashboardNavigationChallengesQuery,
  refetchSubspacesInSpaceQuery,
  useDeleteSpaceMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { DeleteIcon } from '../../../../../journey/space/pages/SpaceSettings/icon/DeleteIcon';
import SpaceProfileDeleteDialog from '../../../../../journey/space/pages/SpaceSettings/SpaceProfileDeleteDialog';
import { useSubSpace } from '../../../../../journey/subspace/hooks/useChallenge';
import PageContent from '../../../../../../core/ui/content/PageContent';
import { useSpace } from '../../../../../journey/space/SpaceContext/useSpace';

const errorColor = '#940000';

const OpportunitySettingsView: FC = () => {
  const { t } = useTranslation();
  const { subspaceId } = useSubSpace();
  const { spaceNameId, spaceId } = useSpace();
  const notify = useNotification();
  const navigate = useNavigate();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const openDialog = () => setOpenDeleteDialog(true);
  const closeDialog = () => setOpenDeleteDialog(false);

  const [deleteOpportunity, { loading }] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchSubspacesInSpaceQuery({
        spaceId: spaceId,
      }),
      refetchSpaceDashboardNavigationChallengesQuery({
        spaceId: spaceNameId,
      }),
    ],
    onCompleted: data => {
      notify(t('pages.admin.space.notifications.space-removed', { name: data.deleteSpace.nameID }), 'success');
      navigate(`/${spaceNameId}`, { replace: true });
    },
  });

  const handleDelete = () => {
    deleteOpportunity({
      variables: {
        input: {
          ID: subspaceId,
        },
      },
    });
  };

  return (
    <PageContent background="transparent">
      <PageContentBlock sx={{ borderColor: errorColor }}>
        <PageContentBlockHeader sx={{ color: errorColor }} title={t('components.deleteSpace.title')} />
        <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }} onClick={openDialog}>
          <DeleteIcon />
          <Caption>{t('components.deleteSpace.description', { entity: t('common.subspace') })}</Caption>
        </Box>
      </PageContentBlock>
      {openDeleteDialog && (
        <SpaceProfileDeleteDialog
          entity={'Subspace'}
          open={openDeleteDialog}
          onClose={closeDialog}
          onDelete={handleDelete}
          submitting={loading}
        />
      )}
    </PageContent>
  );
};

export default OpportunitySettingsView;
