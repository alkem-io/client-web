import React, { FC, useCallback, useState } from 'react';

import useNavigate from '../../../../../core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchableList, { SearchableListItem } from '../../components/SearchableList';
import Loading from '../../../../../core/ui/loading/Loading';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import { useSubSpace } from '../../../../journey/subspace/hooks/useSubSpace';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { CreateOpportunityForm } from '../../../../journey/opportunity/forms/CreateOpportunityForm';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { OpportunityIcon } from '../../../../journey/opportunity/icon/OpportunityIcon';
import {
  refetchSubspacesInSpaceQuery,
  useCreateSubspaceMutation,
  useDeleteSpaceMutation,
  useSubspacesInSpaceQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { ContentCopyOutlined, DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import MenuItemWithIcon from '../../../../../core/ui/menu/MenuItemWithIcon';
import EntityConfirmDeleteDialog from '../../../../journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import Gutters from '../../../../../core/ui/grid/Gutters';

export const OpportunityList: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { spaceNameId } = useSpace();
  const { subspaceId } = useSubSpace();
  const { challengeNameId = '' } = useUrlParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SearchableListItem | undefined>(undefined);

  const { data: subspacesListQuery, loading } = useSubspacesInSpaceQuery({
    variables: { spaceId: subspaceId },
    skip: !subspaceId,
  });

  const subsubspaces =
    subspacesListQuery?.lookup.space?.subspaces?.map(s => ({
      id: s.id,
      profile: {
        displayName: s.profile.displayName,
        url: buildSettingsUrl(s.profile.url),
        avatar: {
          uri: s.profile.cardBanner?.uri ?? '',
        },
      },
    })) || [];

  const [deleteOpportunity] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchSubspacesInSpaceQuery({
        spaceId: subspaceId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.subsubspace.notifications.subsubspace-removed'), 'success'),
  });

  const handleDelete = (item: SearchableListItem) => {
    return deleteOpportunity({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  const [createSubspace] = useCreateSubspaceMutation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: subspaceId })],
    awaitRefetchQueries: true,
    onCompleted: () => {
      notify(t('pages.admin.subsubspace.notifications.subsubspace-created'), 'success');
    },
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createSubspace({
        variables: {
          input: {
            spaceID: subspaceId,
            context: {
              vision: value.vision,
            },
            profileData: {
              displayName: value.displayName,
              tagline: value.tagline,
            },
            tags: value.tags,
            collaborationData: {
              addDefaultCallouts: value.addDefaultCallouts,
            },
          },
        },
      });

      if (!data?.createSubspace) {
        return;
      }
      if (data?.createSubspace.profile.url) {
        navigate(buildSettingsUrl(data?.createSubspace.profile.url));
      }
    },
    [navigate, createSubspace, spaceNameId, subspaceId, challengeNameId]
  );

  const onDeleteClick = (item: SearchableListItem) => {
    setDeleteDialogOpen(true);
    setSelectedItem(item);
  };

  const clearDeleteState = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(undefined);
  };

  const onDeleteConfirmation = () => {
    if (selectedItem) {
      handleDelete(selectedItem);
      setDeleteDialogOpen(false);
    }
  };

  const onDuplicateClick = (item: SearchableListItem) => {
    // todo: implement
    setSelectedItem(item);
  };

  const onSaveAsTemplateClick = (item: SearchableListItem) => {
    // todo: implement
    setSelectedItem(item);
  };

  const getActions = (item: SearchableListItem) => (
    <>
      <MenuItemWithIcon disabled iconComponent={ContentCopyOutlined} onClick={() => onDuplicateClick(item)}>
        Duplicate Subspace
      </MenuItemWithIcon>
      <MenuItemWithIcon disabled iconComponent={DownloadForOfflineOutlined} onClick={() => onSaveAsTemplateClick(item)}>
        Save As Template
      </MenuItemWithIcon>
      <MenuItemWithIcon iconComponent={DeleteOutline} onClick={() => onDeleteClick(item)}>
        {t('buttons.delete')}
      </MenuItemWithIcon>
    </>
  );

  if (loading) return <Loading text={'Loading spaces'} />;

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Button
          startIcon={<AddOutlinedIcon />}
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ alignSelf: 'end', marginBottom: 2 }}
        >
          {t('buttons.create')}
        </Button>
        <Gutters disablePadding>
          <SearchableList data={subsubspaces} getActions={getActions} journeyTypeName="subsubspace" />
        </Gutters>
      </Box>
      <JourneyCreationDialog
        open={open}
        icon={<OpportunityIcon />}
        journeyName={t('common.subspace')}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
        formComponent={CreateOpportunityForm}
      />
      <EntityConfirmDeleteDialog
        entity={t('common.subsubspace')}
        open={deleteDialogOpen}
        onClose={clearDeleteState}
        onDelete={onDeleteConfirmation}
        description={'components.deleteEntity.confirmDialog.descriptionShort'}
      />
    </>
  );
};

export default OpportunityList;
