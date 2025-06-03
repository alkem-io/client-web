import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import { FC, useCallback, useState } from 'react';
import {
  refetchSpaceAdminDefaultTemplatesCollaborationDetailsQuery,
  refetchSubspacesInSpaceQuery,
  useSpaceAdminDefaultTemplatesCollaborationDetailsQuery,
  useDeleteSpaceMutation,
  useSpaceCollaborationIdLazyQuery,
  useSubspacesInSpaceQuery,
  useUpdateTemplateDefaultMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  SpaceLevel,
  TemplateDefaultType,
  TemplateType,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { useNotification } from '@/core/ui/notifications/useNotification';
import SearchableList, { SearchableListItem } from '@/domain/platform/admin/components/SearchableList';
import EntityConfirmDeleteDialog from '@/domain/shared/components/EntityConfirmDeleteDialog';
import { useSubspaceCreation } from '@/domain/space/hooks/useSubspaceCreation/useSubspaceCreation';
import { CreateSubspaceForm } from '@/domain/space/components/subspaces/CreateSubspaceForm';
import { SpaceFormValues } from '@/domain/space/components/subspaces/SubspaceCreationDialog/SubspaceCreationForm';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { TemplateContentSpaceFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateContentSpaceForm';
import { useCreateSpaceContentTemplate } from '@/domain/templates/hooks/useCreateSpaceContentTemplate';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { Cached, DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import { SubspaceCreationDialog } from '../../space/components/subspaces/SubspaceCreationDialog/SubspaceCreationDialog';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import InnovationFlowCalloutsPreview from '@/domain/collaboration/callout/CalloutsPreview/InnovationFlowCalloutsPreview';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import InnovationFlowProfileView from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowProfileView';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SelectDefaultCollaborationTemplateDialog from '@/domain/templates-manager/SelectDefaultCollaborationTemplate/SelectDefaultCollaborationTemplateDialog';
import SpaceL1Icon2 from '../../space/icons/SpaceL1Icon2';
import { SpaceL2Icon } from '../../space/icons/SpaceL2Icon';

export interface SpaceAdminSubspacesPageProps extends SettingsPageProps {
  useL0Layout: boolean;
  spaceId: string;
  templatesEnabled: boolean;
  level: SpaceLevel;
}

const SpaceAdminSubspacesPage: FC<SpaceAdminSubspacesPageProps> = ({
  spaceId,
  useL0Layout,
  routePrefix,
  templatesEnabled,
  level,
}) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>();
  const [selectCollaborationTemplateDialogOpen, setSelectCollaborationTemplateDialogOpen] = useState(false);
  const [subspaceCreationDialogOpen, setSubspaceCreationDialogOpen] = useState(false);
  const [saveAsTemplateDialogSelectedItem, setSaveAsTemplateDialogSelectedItem] = useState<SearchableListItem>();
  const [deleteDialogSelectedItem, setDeleteDialogSelectedItem] = useState<SearchableListItem>();

  const { data: subspacesListQuery, loading } = useSubspacesInSpaceQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const subspaces =
    subspacesListQuery?.lookup.space?.subspaces?.map(s => ({
      id: s.id,
      profile: {
        displayName: s.about.profile.displayName,
        url: buildSettingsUrl(s.about.profile.url),
        avatar: {
          uri: s.about.profile.cardBanner?.uri ?? '',
        },
      },
      level: s.level,
    })) || [];

  const [deleteSpace] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchSubspacesInSpaceQuery({
        spaceId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.subsubspace.notifications.subsubspace-removed'), 'success'),
  });

  const handleDelete = (item: SearchableListItem) => {
    return deleteSpace({
      variables: {
        spaceId: item.id,
      },
    });
  };

  const { createSubspace } = useSubspaceCreation({
    onCompleted: () => {
      notify(t('pages.admin.subsubspace.notifications.subsubspace-created'), 'success');
    },
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: spaceId })],
    awaitRefetchQueries: true,
  });

  const handleCreate = useCallback(
    async (value: SpaceFormValues) => {
      const result = await createSubspace({
        spaceID: spaceId,
        about: {
          profile: {
            displayName: value.displayName,
            tagline: value.tagline,
            description: value.description ?? '',
            visuals: value.visuals,
            tags: value.tags,
          },
          why: value.why ?? '',
        },
        addTutorialCallouts: value.addTutorialCallouts,
        spaceTemplateId: value.spaceTemplateId,
      });

      if (!result?.about.profile?.url) {
        notify(t('pages.admin.subsubspace.notifications.error-creating-subsubspace'), 'error');
        return;
      }
      navigate(buildSettingsUrl(result.about.profile.url));
    },
    [navigate, createSubspace, spaceId]
  );

  // Templates usage
  const { data, loading: adminTemplatesLoading } = useSpaceAdminDefaultTemplatesCollaborationDetailsQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId || !templatesEnabled,
  });
  const templatesManager = data?.lookup.space?.templatesManager;
  const templateDefaults = templatesManager?.templateDefaults;
  const templateSetPrivileges = templatesManager?.templatesSet?.authorization?.myPrivileges ?? [];
  const canCreateTemplate = templateSetPrivileges?.includes(AuthorizationPrivilege.Create);
  const defaultSubspaceTemplate = templateDefaults?.find(
    templateDefault => templateDefault.type === TemplateDefaultType.SpaceSubspace
  );

  const { handleCreateSpaceContentTemplate: handleCreateCollaborationTemplate } = useCreateSpaceContentTemplate();
  const handleSaveAsTemplate = async (values: TemplateContentSpaceFormSubmittedValues) => {
    await handleCreateCollaborationTemplate(values, spaceId);
    notify(t('pages.admin.subspace.notifications.templateSaved'), 'success');
    setSaveAsTemplateDialogSelectedItem(undefined);
  };

  const [fetchCollaborationId] = useSpaceCollaborationIdLazyQuery();
  const getDefaultTemplateValues = async () => {
    if (saveAsTemplateDialogSelectedItem?.id) {
      const { data } = await fetchCollaborationId({
        variables: {
          spaceId: saveAsTemplateDialogSelectedItem?.id,
        },
      });
      return {
        type: TemplateType.Space,
        collaboration: {
          id: data?.lookup.space?.collaboration.id,
        },
      };
    } else {
      throw new Error('No item selected');
    }
  };

  const onDeleteConfirmation = () => {
    if (deleteDialogSelectedItem) {
      handleDelete(deleteDialogSelectedItem);
      setDeleteDialogSelectedItem(undefined);
    }
  };

  const [updateTemplateDefault] = useUpdateTemplateDefaultMutation();
  const handleSelectCollaborationTemplate = async (spaceTemplateId: string) => {
    if (!defaultSubspaceTemplate) {
      return;
    }
    await updateTemplateDefault({
      variables: {
        templateDefaultID: defaultSubspaceTemplate?.id,
        templateID: spaceTemplateId,
      },
      refetchQueries: [
        refetchSpaceAdminDefaultTemplatesCollaborationDetailsQuery({
          spaceId,
        }),
      ],
      awaitRefetchQueries: true,
    });
    setSelectCollaborationTemplateDialogOpen(false);
  };

  const getSubSpaceActions = (item: SearchableListItem) => (
    <>
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

  // Show the correct icon
  const subspaceIcon = level === SpaceLevel.L0 ? <SpaceL1Icon2 fill="primary" /> : <SpaceL2Icon fill="primary" />;

  if (loading || adminTemplatesLoading) return <Loading text={'Loading spaces'} />;
  return (
    <LayoutSwitcher currentTab={SettingsSection.Subspaces} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
      <>
        {templatesEnabled && (
          <PageContentBlock>
            <PageContentBlockHeader title={t('pages.admin.space.sections.subspaces.defaultSettings.title')} />
            <Caption>{t('pages.admin.space.sections.subspaces.defaultSettings.description')}</Caption>
            {defaultSubspaceTemplate?.template ? (
              <>
                <BlockSectionTitle>{defaultSubspaceTemplate.template.profile.displayName}</BlockSectionTitle>
                <InnovationFlowProfileView
                  innovationFlow={defaultSubspaceTemplate.template.contentSpace?.collaboration?.innovationFlow}
                />
                <InnovationFlowStates
                  states={defaultSubspaceTemplate.template.contentSpace?.collaboration?.innovationFlow.states}
                  selectedState={selectedState}
                  onSelectState={state =>
                    setSelectedState(currentState =>
                      currentState === state.displayName ? undefined : state.displayName
                    )
                  }
                />
                <InnovationFlowCalloutsPreview
                  callouts={defaultSubspaceTemplate.template.contentSpace?.collaboration?.calloutsSet.callouts}
                  selectedState={selectedState}
                  loading={loading}
                />
              </>
            ) : (
              <BlockSectionTitle>{t('context.L1.template.defaultTemplate')}</BlockSectionTitle>
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
        )}
        <PageContentBlock>
          <PageContentBlockHeader title={t('common.subspaces')} />
          <Box display="flex" flexDirection="column">
            <Button
              startIcon={<AddOutlinedIcon />}
              variant="contained"
              onClick={() => setSubspaceCreationDialogOpen(true)}
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
        <SubspaceCreationDialog
          open={subspaceCreationDialogOpen}
          icon={subspaceIcon}
          spaceDisplayName={t('common.subspace')}
          onClose={() => setSubspaceCreationDialogOpen(false)}
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
            templateType={TemplateType.Space}
            onSubmit={handleSaveAsTemplate}
            getDefaultValues={getDefaultTemplateValues}
          />
        )}
      </>
    </LayoutSwitcher>
  );
};

export default SpaceAdminSubspacesPage;
