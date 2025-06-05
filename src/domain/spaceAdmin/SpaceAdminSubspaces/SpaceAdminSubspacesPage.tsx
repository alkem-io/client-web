import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { SettingsPageProps } from '@/domain/platform/admin/layout/EntitySettingsLayout/types';
import { FC, useCallback, useState } from 'react';
import {
  refetchSubspacesInSpaceQuery,
  useSpaceAdminDefaultSpaceTemplatesDetailsQuery,
  useDeleteSpaceMutation,
  useSubspacesInSpaceQuery,
  useUpdateTemplateDefaultMutation,
  refetchSpaceAdminDefaultSpaceTemplatesDetailsQuery,
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
import { TemplateSpaceFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateSpaceForm';
import { useCreateSpaceTemplate } from '@/domain/templates/hooks/useCreateSpaceTemplate';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { Cached, DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import { SubspaceCreationDialog } from '../../space/components/subspaces/SubspaceCreationDialog/SubspaceCreationDialog';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import InnovationFlowCalloutsPreview from '@/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import InnovationFlowProfileView from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowProfileView';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SelectDefaultCollaborationTemplateDialog from '@/domain/templates-manager/SelectDefaultCollaborationTemplate/SelectDefaultCollaborationTemplateDialog';
import SpaceL1Icon2 from '../../space/icons/SpaceL1Icon2';
import { SpaceL2Icon } from '../../space/icons/SpaceL2Icon';
import { EmptySpaceTemplateModel } from '@/domain/templates/models/SpaceTemplate';
import { error as logError } from '@/core/logging/sentry/log';

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
  const [selectCollaborationTemplateDialogOpen, setSelectSpaceTemplateDialogOpen] = useState(false);
  const [subspaceCreationDialogOpen, setSubspaceCreationDialogOpen] = useState(false);
  const [deleteDialogSelectedItem, setDeleteDialogSelectedItem] = useState<SearchableListItem>();
  const [saveAsTemplateDialogSelectedSpace, setSaveAsTemplateDialogSelectedSpace] = useState<SearchableListItem>();

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
  const { data, loading: adminTemplatesLoading } = useSpaceAdminDefaultSpaceTemplatesDetailsQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId || !templatesEnabled,
  });
  const templatesManager = data?.lookup.space?.templatesManager;
  const templateDefaults = templatesManager?.templateDefaults;
  const templateSet = templatesManager?.templatesSet;
  const templateSetPrivileges = templateSet?.authorization?.myPrivileges ?? [];
  const canCreateTemplate = templateSetPrivileges?.includes(AuthorizationPrivilege.Create);
  const defaultSubspaceTemplate = templateDefaults?.find(
    templateDefault => templateDefault.type === TemplateDefaultType.SpaceSubspace
  );

  //////////
  // Saving as template
  const { handleCreateSpaceTemplate: handleCreateSpaceTemplate } = useCreateSpaceTemplate();
  const handleSaveAsTemplate = async (values: TemplateSpaceFormSubmittedValues) => {
    const templatesSetId = templateSet?.id;

    if (!templatesSetId) {
      logError(`No TM templateSet found for spaceId: ${spaceId}`, { label: 'TMPL_ERROR' });
      return;
    }

    await handleCreateSpaceTemplate(values, templatesSetId);
    setSaveAsTemplateDialogSelectedSpace(undefined);
    notify(t('pages.admin.subspace.notifications.templateSaved'), 'success');
  };

  // Fetch space info for the selected space to use as input for the template
  const defaultTemplateValues = saveAsTemplateDialogSelectedSpace
    ? {
        id: '',
        type: TemplateType.Space,
        profile: {
          displayName: saveAsTemplateDialogSelectedSpace.profile.displayName,
        },
        modelSpaceId: saveAsTemplateDialogSelectedSpace.id,
      }
    : EmptySpaceTemplateModel;

  const onDeleteConfirmation = () => {
    if (deleteDialogSelectedItem) {
      handleDelete(deleteDialogSelectedItem);
      setDeleteDialogSelectedItem(undefined);
    }
  };

  const [updateTemplateDefault] = useUpdateTemplateDefaultMutation();
  const handleSelectSpaceTemplate = async (spaceTemplateId: string) => {
    if (!defaultSubspaceTemplate) {
      return;
    }
    await updateTemplateDefault({
      variables: {
        templateDefaultID: defaultSubspaceTemplate?.id,
        templateID: spaceTemplateId,
      },
      refetchQueries: [
        refetchSpaceAdminDefaultSpaceTemplatesDetailsQuery({
          spaceId,
        }),
      ],
      awaitRefetchQueries: true,
    });
    setSelectSpaceTemplateDialogOpen(false);
  };

  const getSubSpaceActions = (item: SearchableListItem) => (
    <>
      {canCreateTemplate && (
        <MenuItemWithIcon
          iconComponent={DownloadForOfflineOutlined}
          onClick={() => {
            setSaveAsTemplateDialogSelectedSpace(item);
          }}
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
              <Button variant="outlined" startIcon={<Cached />} onClick={() => setSelectSpaceTemplateDialogOpen(true)}>
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
          onClose={() => setSelectSpaceTemplateDialogOpen(false)}
          onSelectCollaborationTemplate={handleSelectSpaceTemplate}
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
        {Boolean(saveAsTemplateDialogSelectedSpace) && (
          <CreateTemplateDialog
            open
            onClose={() => {
              setSaveAsTemplateDialogSelectedSpace(undefined);
            }}
            templateType={TemplateType.Space}
            onSubmit={handleSaveAsTemplate}
            getDefaultValues={() => Promise.resolve(defaultTemplateValues)}
          />
        )}
      </>
    </LayoutSwitcher>
  );
};

export default SpaceAdminSubspacesPage;
