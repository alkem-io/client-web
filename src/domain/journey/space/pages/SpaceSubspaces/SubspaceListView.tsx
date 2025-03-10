import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {
  refetchAdminSpaceSubspacesPageQuery,
  refetchSpaceDashboardNavigationChallengesQuery,
  refetchSubspacesInSpaceQuery,
  useAdminSpaceSubspacesPageQuery,
  useDeleteSpaceMutation,
  useSpaceCollaborationIdLazyQuery,
  useSpaceTemplatesManagerQuery,
  useUpdateTemplateDefaultMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { JourneyCreationDialog } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationDialog';
import SubspaceIcon2 from '@/domain/journey/subspace/icon/SubspaceIcon2';
import { JourneyFormValues } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationForm';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { CreateSubspaceForm } from '@/domain/journey/subspace/forms/CreateSubspaceForm';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import InnovationFlowProfileView from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowProfileView';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import { Actions } from '@/core/ui/actions/Actions';
import { Cached, DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import SelectDefaultCollaborationTemplateDialog from '@/domain/templates-manager/SelectDefaultCollaborationTemplate/SelectDefaultCollaborationTemplateDialog';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import Gutters from '@/core/ui/grid/Gutters';
import SearchableList, { SearchableListItem } from '@/domain/platform/admin/components/SearchableList';
import EntityConfirmDeleteDialog from '../SpaceSettings/EntityConfirmDeleteDialog';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import {
  AuthorizationPrivilege,
  SpaceLevel,
  TemplateDefaultType,
  TemplateType,
} from '@/core/apollo/generated/graphql-schema';
import { CollaborationTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/CollaborationTemplateForm';
import { useCreateCollaborationTemplate } from '@/domain/templates/hooks/useCreateCollaborationTemplate';
import { useSubspaceCreation } from '@/domain/shared/utils/useSubspaceCreation/useSubspaceCreation';
import InnovationFlowCalloutsPreview from '@/domain/collaboration/callout/CalloutsPreview/InnovationFlowCalloutsPreview';

export const SubspaceListView = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();

  const { spaceId } = useSpace();
  const [journeyCreationDialogOpen, setJourneyCreationDialogOpen] = useState(false);
  const [selectCollaborationTemplateDialogOpen, setSelectCollaborationTemplateDialogOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>();
  const [saveAsTemplateDialogSelectedItem, setSaveAsTemplateDialogSelectedItem] = useState<SearchableListItem>();
  const [deleteDialogSelectedItem, setDeleteDialogSelectedItem] = useState<SearchableListItem>();

  const { data, loading } = useAdminSpaceSubspacesPageQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId,
  });
  const [fetchCollaborationId] = useSpaceCollaborationIdLazyQuery();

  const templateDefaults = data?.lookup.space?.templatesManager?.templateDefaults;
  const defaultSubspaceTemplate = templateDefaults?.find(
    templateDefault => templateDefault.type === TemplateDefaultType.SpaceSubspace
  );

  const subspaces = useMemo(() => {
    return (
      data?.lookup.space?.subspaces?.map(s => ({
        id: s.id,
        profile: {
          displayName: s.profile.displayName,
          url: buildSettingsUrl(s.profile.url),
          avatar: {
            uri: s.profile.avatar?.uri ?? '',
          },
        },
        level: s.level,
      })) || []
    );
  }, [data]);

  const [deleteSubspace] = useDeleteSpaceMutation({
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
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.subspace.notifications.subspace-removed'), 'success'),
  });

  const handleDelete = (item: { id: string }) => {
    return deleteSubspace({
      variables: {
        spaceId: item.id,
      },
    });
  };

  const { createSubspace } = useSubspaceCreation({
    onCompleted: () => {
      notify(t('pages.admin.subspace.notifications.subspace-created'), 'success');
    },
    refetchQueries: [refetchAdminSpaceSubspacesPageQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createSubspace({
        spaceID: spaceId,
        displayName: value.displayName,
        tagline: value.tagline,
        background: value.background ?? '',
        vision: value.vision,
        tags: value.tags,
        addTutorialCallouts: value.addTutorialCallouts,
        collaborationTemplateId: value.collaborationTemplateId,
        visuals: value.visuals,
      });

      if (!result) {
        return;
      }
      navigate(buildSettingsUrl(result.profile.url));
    },
    [navigate, createSubspace, spaceId]
  );

  const [updateTemplateDefault] = useUpdateTemplateDefaultMutation();
  const handleSelectCollaborationTemplate = async (collaborationTemplateId: string) => {
    if (!defaultSubspaceTemplate) {
      return;
    }
    await updateTemplateDefault({
      variables: {
        templateDefaultID: defaultSubspaceTemplate?.id,
        templateID: collaborationTemplateId,
      },
      refetchQueries: [
        refetchAdminSpaceSubspacesPageQuery({
          spaceId,
        }),
      ],
      awaitRefetchQueries: true,
    });
    setSelectCollaborationTemplateDialogOpen(false);
  };

  // const onDuplicateClick = (_item: SearchableListItem) => {
  //   throw new Error('Not implemented');
  // };

  // check for TemplateCreation privileges
  const { data: templateData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const templateSetPrivileges =
    templateData?.lookup.space?.templatesManager?.templatesSet?.authorization?.myPrivileges ?? [];
  const canCreateTemplate = templateSetPrivileges?.includes(AuthorizationPrivilege.Create);

  const { handleCreateCollaborationTemplate } = useCreateCollaborationTemplate();
  const handleSaveAsTemplate = async (values: CollaborationTemplateFormSubmittedValues) => {
    await handleCreateCollaborationTemplate(values, spaceId);
    notify(t('pages.admin.subspace.notifications.templateSaved'), 'success');
    setSaveAsTemplateDialogSelectedItem(undefined);
  };

  const onDeleteConfirmation = async () => {
    if (deleteDialogSelectedItem) {
      await handleDelete(deleteDialogSelectedItem);
      setDeleteDialogSelectedItem(undefined);
    }
  };

  const getDefaultTemplateValues = async () => {
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
  };

  const getSubSpaceActions = (item: SearchableListItem) => (
    <>
      {/* <MenuItemWithIcon disabled iconComponent={ContentCopyOutlined} onClick={() => onDuplicateClick(item)}>
        Duplicate Subspace
      </MenuItemWithIcon> */}
      {canCreateTemplate && (
        <MenuItemWithIcon
          iconComponent={DownloadForOfflineOutlined}
          onClick={() => setSaveAsTemplateDialogSelectedItem(item)}
        >
          {t('buttons.saveAsTemplate')}
        </MenuItemWithIcon>
      )}
      <MenuItemWithIcon iconComponent={DeleteOutline} onClick={() => setDeleteDialogSelectedItem(item)}>
        {t('buttons.delete')}
      </MenuItemWithIcon>
    </>
  );

  const level = SpaceLevel.L1;

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.admin.space.sections.subspaces.defaultSettings.title')} />
        <Caption>{t('pages.admin.space.sections.subspaces.defaultSettings.description')}</Caption>
        {defaultSubspaceTemplate?.template ? (
          <>
            <BlockSectionTitle>{defaultSubspaceTemplate.template.profile.displayName}</BlockSectionTitle>
            <InnovationFlowProfileView
              innovationFlow={defaultSubspaceTemplate.template.collaboration?.innovationFlow}
            />
            <InnovationFlowStates
              states={defaultSubspaceTemplate.template.collaboration?.innovationFlow.states}
              selectedState={selectedState}
              onSelectState={state =>
                setSelectedState(currentState => (currentState === state.displayName ? undefined : state.displayName))
              }
            />
            <InnovationFlowCalloutsPreview
              callouts={defaultSubspaceTemplate.template.collaboration?.calloutsSet.callouts}
              selectedState={selectedState}
              loading={loading}
            />
          </>
        ) : (
          <BlockSectionTitle>{t(`context.${level}.template.defaultTemplate`)}</BlockSectionTitle>
        )}

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
            <SearchableList data={subspaces} getActions={getSubSpaceActions} loading={loading} />
          </Gutters>
        </Box>
      </PageContentBlock>
      <SelectDefaultCollaborationTemplateDialog
        spaceId={spaceId}
        open={selectCollaborationTemplateDialogOpen}
        defaultCollaborationTemplateId={defaultSubspaceTemplate?.template?.id}
        onClose={() => setSelectCollaborationTemplateDialogOpen(false)}
        onSelectCollaborationTemplate={handleSelectCollaborationTemplate}
      />
      <JourneyCreationDialog
        open={journeyCreationDialogOpen}
        icon={<SubspaceIcon2 fill="primary" />}
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
          getDefaultValues={getDefaultTemplateValues}
        />
      )}
    </>
  );
};

export default SubspaceListView;
