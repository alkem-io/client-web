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
  useSpaceCollaborationIdLazyQuery,
  useUpdateTemplateDefaultMutation,
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
import SelectDefaultCollaborationTemplateDialog from '../../../../templates-manager/SelectDefaultCollaborationTemplate/SelectDefaultCollaborationTemplateDialog';
import MenuItemWithIcon from '../../../../../core/ui/menu/MenuItemWithIcon';
import Gutters from '../../../../../core/ui/grid/Gutters';
import SearchableList, { SearchableListItem } from '../../../../platform/admin/components/SearchableList';
import EntityConfirmDeleteDialog from '../SpaceSettings/EntityConfirmDeleteDialog';
import CreateTemplateDialog from '../../../../templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { CollaborationTemplateFormSubmittedValues } from '../../../../templates/components/Forms/CollaborationTemplateForm';
import { useCreateCollaborationTemplate } from '../../../../templates/hooks/useCreateCollaborationTemplate';

export const SubspaceListView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { spaceNameId, spaceId } = useSpace();
  const navigate = useNavigate();
  const [journeyCreationDialogOpen, setJourneyCreationDialogOpen] = useState(false);
  const [selectCollaborationTemplateDialogOpen, setSelectCollaborationTemplateDialogOpen] = useState(false);

  const { data, loading } = useAdminSpaceSubspacesPageQuery({
    variables: {
      spaceId: spaceNameId,
    },
  });
  const [fetchCollaborationId] = useSpaceCollaborationIdLazyQuery();

  const templatesManager = data?.space.templatesManager;
  const templateDefaults = templatesManager?.templateDefaults;
  const subspaceTemplateDefault = templateDefaults ? templateDefaults[0] : undefined; // TODO
  const subspaceTemplateDefaultID = subspaceTemplateDefault?.id || ''; // TODO
  const subspaceTemplateWithCollaboration = subspaceTemplateDefault?.template;
  const subspaceTemplateWithCollaborationID = subspaceTemplateWithCollaboration?.id || ''; // TODO
  const collaborationFromTemplate = subspaceTemplateDefault?.template?.collaboration;
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [saveAsTemplateDialogSelectedItem, setSaveAsTemplateDialogSelectedItem] = useState<SearchableListItem>();
  const [deleteDialogSelectedItem, setDeleteDialogSelectedItem] = useState<SearchableListItem>();

  const innovationFlowFromCollaborationTemplate = subspaceTemplateDefault?.template?.collaboration?.innovationFlow;
  useEffect(() => {
    setSelectedState(innovationFlowFromCollaborationTemplate?.states?.[0].displayName);
  }, [innovationFlowFromCollaborationTemplate?.states?.[0]?.displayName]);

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
              addTutorialCallouts: value.addTutorialCallouts,
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

  const [updateTemplateDefault] = useUpdateTemplateDefaultMutation();
  const handleSelectCollaborationTemplate = async (collaborationTemplateId: string) => {
    await updateTemplateDefault({
      variables: {
        templateDefaultID: subspaceTemplateDefaultID,
        templateID: collaborationTemplateId,
      },
      refetchQueries: [
        refetchAdminSpaceSubspacesPageQuery({
          spaceId: spaceNameId,
        }),
      ],
      awaitRefetchQueries: true,
    });
    setSelectCollaborationTemplateDialogOpen(false);
  };

  const onDuplicateClick = (_item: SearchableListItem) => {
    throw new Error('Not implemented');
  };

  const { handleCreateCollaborationTemplate } = useCreateCollaborationTemplate();
  const handleSaveAsTemplate = async (values: CollaborationTemplateFormSubmittedValues) => {
    await handleCreateCollaborationTemplate(values, spaceNameId);
    notify(t('pages.admin.subspace.notifications.templateSaved'), 'success');
    setSaveAsTemplateDialogSelectedItem(undefined);
  };

  const onDeleteConfirmation = async () => {
    if (deleteDialogSelectedItem) {
      await handleDelete(deleteDialogSelectedItem);
      setDeleteDialogSelectedItem(undefined);
    }
  };

  const getSubSpaceActions = (item: SearchableListItem) => (
    <>
      <MenuItemWithIcon disabled iconComponent={ContentCopyOutlined} onClick={() => onDuplicateClick(item)}>
        Duplicate Subspace
      </MenuItemWithIcon>
      <MenuItemWithIcon
        iconComponent={DownloadForOfflineOutlined}
        onClick={() => setSaveAsTemplateDialogSelectedItem(item)}
      >
        {t('buttons.saveAsTemplate')}
      </MenuItemWithIcon>
      <MenuItemWithIcon iconComponent={DeleteOutline} onClick={() => setDeleteDialogSelectedItem(item)}>
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
          <BlockSectionTitle>{subspaceTemplateDefault?.template?.profile.displayName}</BlockSectionTitle>
          <InnovationFlowProfileView innovationFlow={collaborationFromTemplate?.innovationFlow} />
          <InnovationFlowStates
            states={collaborationFromTemplate?.innovationFlow?.states}
            selectedState={selectedState}
            onSelectState={state => setSelectedState(state.displayName)}
          />
          <Actions justifyContent="end">
            <Button
              variant="outlined"
              startIcon={<Cached />}
              onClick={() => setSelectCollaborationTemplateDialogOpen(true)}
            >
              {t(
                'pages.admin.space.sections.subspaces.defaultSettings.defaultCollaborationTemplate.selectDifferentTemplate'
              )}
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
      <SelectDefaultCollaborationTemplateDialog
        spaceId={spaceId}
        open={selectCollaborationTemplateDialogOpen}
        defaultCollaborationTemplateId={subspaceTemplateWithCollaborationID}
        onClose={() => setSelectCollaborationTemplateDialogOpen(false)}
        onSelectCollaborationTemplate={handleSelectCollaborationTemplate}
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
        open={Boolean(deleteDialogSelectedItem)}
        onClose={() => setDeleteDialogSelectedItem(undefined)}
        onDelete={onDeleteConfirmation}
        description={'components.deleteEntity.confirmDialog.descriptionShort'}
      />
      {Boolean(saveAsTemplateDialogSelectedItem) && (
        <CreateTemplateDialog
          open
          onClose={() => setSaveAsTemplateDialogSelectedItem(undefined)}
          templateType={TemplateType.Collaboration}
          onSubmit={handleSaveAsTemplate}
          getDefaultValues={async () => {
            if (saveAsTemplateDialogSelectedItem?.id) {
              const { data } = await fetchCollaborationId({
                variables: {
                  spaceId: saveAsTemplateDialogSelectedItem?.id,
                },
              });
              return {
                type: TemplateType.Collaboration,
                collaboration: {
                  id: data?.lookup.space?.collaboration.id,
                },
              };
            } else {
              throw new Error('No item selected');
            }
          }}
        />
      )}
    </>
  );
};

export default SubspaceListView;
