import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import { FC, useState } from 'react';
import {
  refetchSubspacesInSpaceQuery,
  useSpaceAdminDefaultSpaceTemplatesDetailsQuery,
  useDeleteSpaceMutation,
  useSubspacesInSpaceQuery,
  useUpdateTemplateDefaultMutation,
  refetchSpaceAdminDefaultSpaceTemplatesDetailsQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { useNotification } from '@/core/ui/notifications/useNotification';
import SearchableList, { SearchableListItem } from '@/domain/platformAdmin/components/SearchableList';
import EntityConfirmDeleteDialog from '@/domain/shared/components/EntityConfirmDeleteDialog';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { Cached, DeleteOutline, DownloadForOfflineOutlined, SwapVert } from '@mui/icons-material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SubspacesSortDialog from './SubspacesSortDialog/SubspacesSortDialog';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import InnovationFlowCalloutsPreview from '@/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import InnovationFlowProfileView from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowProfileView';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SelectDefaultSpaceTemplateDialog from '@/domain/templates-manager/SelectDefaultSpaceTemplate/SelectDefaultSpaceTemplateDialog';
import CreateSpaceTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateSpaceTemplateDialog';
import CreateSubspace from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace';

export interface SpaceAdminSubspacesPageProps extends SettingsPageProps {
  useL0Layout: boolean;
  spaceId: string;
  templatesEnabled: boolean;
}

const SpaceAdminSubspacesPage: FC<SpaceAdminSubspacesPageProps> = ({
  spaceId,
  useL0Layout,
  routePrefix,
  templatesEnabled,
}) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>();
  const [selectSpaceTemplateDialogOpen, setSelectSpaceTemplateDialogOpen] = useState(false);
  const [subspaceCreationDialogOpen, setSubspaceCreationDialogOpen] = useState(false);
  const [deleteDialogSelectedItem, setDeleteDialogSelectedItem] = useState<SearchableListItem>();
  const [saveAsTemplateDialogSelectedSpace, setSaveAsTemplateDialogSelectedSpace] = useState<SearchableListItem>();
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

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

  // Templates usage
  const { data, loading: adminTemplatesLoading } = useSpaceAdminDefaultSpaceTemplatesDetailsQuery({
    variables: {
      spaceId: spaceId,
    },
    skip: !spaceId || !templatesEnabled,
  });
  const templatesManager = data?.lookup.space?.templatesManager;
  const templateDefaults = templatesManager?.templateDefaults;
  const templatesSet = templatesManager?.templatesSet;
  const templateSetPrivileges = templatesSet?.authorization?.myPrivileges ?? [];
  const canCreateTemplate = templateSetPrivileges?.includes(AuthorizationPrivilege.Create);
  const defaultSubspaceTemplate = templateDefaults?.find(
    templateDefault => templateDefault.type === TemplateDefaultType.SpaceSubspace
  );

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
  const onSubspaceCreated = (subspace: { about: { profile: { url: string } } }) => {
    notify(t('pages.admin.subsubspace.notifications.subsubspace-created'), 'success');
    navigate(buildSettingsUrl(subspace.about.profile.url));
  };

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
                {t('pages.admin.space.sections.subspaces.defaultSettings.defaultSpaceTemplate.selectDifferentTemplate')}
              </Button>
            </Actions>
          </PageContentBlock>
        )}
        <PageContentBlock>
          <PageContentBlockHeader title={t('common.subspaces')} />
          <Box display="flex" flexDirection="column">
            <Box display="flex" gap={1} justifyContent="flex-end" marginBottom={2}>
              <Button startIcon={<SwapVert />} variant="outlined" onClick={() => setSortDialogOpen(true)}>
                {t('pages.admin.space.sections.subspaces.reorderSubspaces')}
              </Button>
              <Button
                startIcon={<AddOutlinedIcon />}
                variant="contained"
                onClick={() => setSubspaceCreationDialogOpen(true)}
              >
                {t('buttons.create')}
              </Button>
            </Box>
            <Gutters disablePadding>
              <SearchableList data={subspaces} getActions={getSubSpaceActions} loading={loading} />
            </Gutters>
          </Box>
        </PageContentBlock>
        <SelectDefaultSpaceTemplateDialog
          spaceId={spaceId}
          open={selectSpaceTemplateDialogOpen}
          defaultSpaceTemplateId={defaultSubspaceTemplate?.template?.id}
          onClose={() => setSelectSpaceTemplateDialogOpen(false)}
          onSelectSpaceTemplate={handleSelectSpaceTemplate}
        />
        <CreateSubspace
          open={subspaceCreationDialogOpen}
          onClose={() => setSubspaceCreationDialogOpen(false)}
          parentSpaceId={spaceId}
          onSubspaceCreated={onSubspaceCreated}
        />
        <EntityConfirmDeleteDialog
          entity={t('common.subspace')}
          name={deleteDialogSelectedItem?.profile.displayName}
          open={Boolean(deleteDialogSelectedItem)}
          onClose={() => setDeleteDialogSelectedItem(undefined)}
          onDelete={onDeleteConfirmation}
          description="components.deleteEntity.confirmDialog.descriptionShortWithName"
        />
        {saveAsTemplateDialogSelectedSpace && templatesSet && (
          <CreateSpaceTemplateDialog
            open
            onClose={() => setSaveAsTemplateDialogSelectedSpace(undefined)}
            spaceId={saveAsTemplateDialogSelectedSpace.id}
            templatesSetId={templatesSet.id}
          />
        )}
        <SubspacesSortDialog open={sortDialogOpen} onClose={() => setSortDialogOpen(false)} spaceId={spaceId} />
      </>
    </LayoutSwitcher>
  );
};

export default SpaceAdminSubspacesPage;
