import React, { FC, useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import useNavigate from '../../../../../core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import Loading from '../../../../../core/ui/loading/Loading';
import {
  refetchAdminSpaceSubspacesPageQuery,
  useAdminSpaceSubspacesPageQuery,
  useCreateSubspaceMutation,
  useDeleteSpaceMutation,
  useUpdateSpaceDefaultInnovationFlowTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import { useSpace } from '../../SpaceContext/useSpace';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { SubspaceIcon } from '../../../subspace/icon/SubspaceIcon';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { buildSettingsUrl } from '../../../../../main/routing/urlBuilders';
import { CreateSubspaceForm } from '../../../subspace/forms/CreateSubspaceForm';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle, Caption } from '../../../../../core/ui/typography';
import InnovationFlowProfileView from '../../../../collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowProfileView';
import InnovationFlowStates from '../../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import { Actions } from '../../../../../core/ui/actions/Actions';
import { Cached, ContentCopyOutlined, DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import SelectDefaultInnovationFlowDialog from '../../../../collaboration/InnovationFlow/InnovationFlowDialogs/SelectDefaultInnovationFlow/SelectDefaultInnovationFlowDialog';
import MenuItemWithIcon from '../../../../../core/ui/menu/MenuItemWithIcon';
import Gutters from '../../../../../core/ui/grid/Gutters';
import SearchableList, { SearchableListItem } from '../../../../platform/admin/components/SearchableList';
import EntityConfirmDeleteDialog from '../SpaceSettings/EntityConfirmDeleteDialog';

export const SubspaceListView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { spaceNameId, spaceId } = useSpace();
  const navigate = useNavigate();
  const [journeyCreationDialogOpen, setJourneyCreationDialogOpen] = useState(false);
  const [innovationFlowDialogOpen, setInnovationFlowDialogOpen] = useState(false);

  const { data, loading } = useAdminSpaceSubspacesPageQuery({
    variables: {
      spaceId: spaceNameId,
    },
  });
  const defaultInnovationFlow = data?.space.defaults?.innovationFlowTemplate;
  const spaceDefaultsID = data?.space.defaults?.id || ''; // How to handle when IDs are not found?
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SearchableListItem | undefined>(undefined);

  useEffect(() => {
    setSelectedState(defaultInnovationFlow?.innovationFlow?.states?.[0].displayName);
  }, [defaultInnovationFlow?.innovationFlow?.states?.[0]?.displayName]);

  const subspaces =
    data?.space?.subspaces?.map(s => ({
      id: s.id,
      profile: {
        displayName: s.profile.displayName,
        url: buildSettingsUrl(s.profile.url),
        avatar: {
          uri: s.profile.cardBanner?.uri ?? '',
        },
      },
    })) || [];

  const [deleteSubspace] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchAdminSpaceSubspacesPageQuery({
        spaceId: spaceNameId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.subspace.notifications.subspace-removed'), 'success'),
  });

  const handleDelete = (item: { id: string }) => {
    return deleteSubspace({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  const [createSubspace] = useCreateSubspaceMutation({
    onCompleted: () => {
      notify(t('pages.admin.subspace.notifications.subspace-created'), 'success');
    },
    refetchQueries: [refetchAdminSpaceSubspacesPageQuery({ spaceId: spaceNameId })],
    awaitRefetchQueries: true,
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const { data } = await createSubspace({
        variables: {
          input: {
            spaceID: spaceNameId,
            profileData: {
              displayName: value.displayName,
              description: value.background,
              tagline: value.tagline,
            },
            context: {
              vision: value.vision,
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
    [navigate, createSubspace, spaceNameId]
  );

  const [updateInnovationFlow] = useUpdateSpaceDefaultInnovationFlowTemplateMutation();
  const handleSelectInnovationFlow = async (innovationFlowTemplateId: string) => {
    await updateInnovationFlow({
      variables: {
        spaceDefaultsID: spaceDefaultsID,
        innovationFlowTemplateId,
      },
      refetchQueries: [
        refetchAdminSpaceSubspacesPageQuery({
          spaceId: spaceNameId,
        }),
      ],
      awaitRefetchQueries: true,
    });
    setInnovationFlowDialogOpen(false);
  };

  const onDeleteClick = (item: SearchableListItem) => {
    setDeleteDialogOpen(true);
    setSelectedItem(item);
  };

  const clearDeleteState = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(undefined);
  };

  const onDeleteConfirmation = async () => {
    if (selectedItem) {
      await handleDelete(selectedItem);
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

  const getSubSpaceActions = (item: SearchableListItem) => (
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

  if (loading) return <Loading text={'Loading Subspaces'} />;

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.admin.space.sections.subspaces.defaultSettings.title')} />
        <Caption>{t('pages.admin.space.sections.subspaces.defaultSettings.description')}</Caption>
        <PageContentBlock>
          <PageContentBlockHeader title={t('common.innovation-flow')} />
          <BlockSectionTitle>{defaultInnovationFlow?.profile.displayName}</BlockSectionTitle>
          <InnovationFlowProfileView innovationFlow={defaultInnovationFlow} />
          <InnovationFlowStates
            states={defaultInnovationFlow?.innovationFlow?.states}
            selectedState={selectedState}
            onSelectState={state => setSelectedState(state.displayName)}
          />
          <Actions justifyContent="end">
            <Button variant="outlined" startIcon={<Cached />} onClick={() => setInnovationFlowDialogOpen(true)}>
              {t('pages.admin.space.sections.subspaces.defaultSettings.defaultInnovationFlow.selectDifferentFlow')}
            </Button>
          </Actions>
        </PageContentBlock>
      </PageContentBlock>
      <PageContentBlock>
        <PageContentBlockHeader title={t('common.subspaces')} />
        <Box display="flex" flexDirection="column">
          <Button
            startIcon={<AddOutlinedIcon />}
            variant="contained"
            onClick={() => setJourneyCreationDialogOpen(true)}
            sx={{ alignSelf: 'end', marginBottom: 2 }}
          >
            {t('buttons.create')}
          </Button>
          <Gutters disablePadding>
            <SearchableList data={subspaces} getActions={getSubSpaceActions} />
          </Gutters>
        </Box>
      </PageContentBlock>
      <SelectDefaultInnovationFlowDialog
        spaceId={spaceId}
        open={innovationFlowDialogOpen}
        defaultInnovationFlowId={defaultInnovationFlow?.id}
        onClose={() => setInnovationFlowDialogOpen(false)}
        onSelectInnovationFlow={handleSelectInnovationFlow}
      />
      <JourneyCreationDialog
        open={journeyCreationDialogOpen}
        icon={<SubspaceIcon />}
        journeyName={t('common.subspace')}
        onClose={() => setJourneyCreationDialogOpen(false)}
        onCreate={handleCreate}
        formComponent={CreateSubspaceForm}
      />
      <EntityConfirmDeleteDialog
        entity={t('common.subspace')}
        open={deleteDialogOpen}
        onClose={clearDeleteState}
        onDelete={onDeleteConfirmation}
        description={'components.deleteEntity.confirmDialog.descriptionShort'}
      />
    </>
  );
};

export default SubspaceListView;
