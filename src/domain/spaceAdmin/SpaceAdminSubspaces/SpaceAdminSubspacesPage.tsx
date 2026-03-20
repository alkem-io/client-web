import { Cached, DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { Box, Button } from '@mui/material';
import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  refetchSpaceAdminDefaultSpaceTemplatesDetailsQuery,
  refetchSubspacesInSpaceQuery,
  useDeleteSpaceMutation,
  useSpaceAdminDefaultSpaceTemplatesDetailsQuery,
  useSubspacesInSpaceQuery,
  useUpdateSubspacePinnedMutation,
  useUpdateSubspacesSortOrderMutation,
  useUpdateTemplateDefaultMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceSortMode, TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import InnovationFlowCalloutsPreview from '@/domain/collaboration/InnovationFlow/InnovationFlowCalloutsPreview';
import InnovationFlowProfileView from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowProfileView';
import InnovationFlowStates from '@/domain/collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';
import type { SearchableListItem } from '@/domain/platformAdmin/components/SearchableList';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import type { SettingsPageProps } from '@/domain/platformAdmin/layout/EntitySettingsLayout/types';
import EntityConfirmDeleteDialog from '@/domain/shared/components/EntityConfirmDeleteDialog';
import CreateSubspace from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace';
import SubspacePinIndicator from '@/domain/space/components/SubspacePinIndicator';
import useSubspacesSorted from '@/domain/space/hooks/useSubspacesSorted';
import CreateSpaceTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateSpaceTemplateDialog';
import SelectDefaultSpaceTemplateDialog from '@/domain/templates-manager/SelectDefaultSpaceTemplate/SelectDefaultSpaceTemplateDialog';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import LayoutSwitcher from '../layout/SpaceAdminLayoutSwitcher';
import SortModeDropdown from './SortModeDropdown';
import SubspacesSortableList from './SubspacesSortableList';

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
  const { data: subspacesListQuery, loading } = useSubspacesInSpaceQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const sortMode = subspacesListQuery?.lookup.space?.settings.sortMode ?? SpaceSortMode.Alphabetical;

  const rawSubspaces =
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
      pinned: s.pinned,
      sortOrder: s.sortOrder,
      about: {
        profile: {
          displayName: s.about.profile.displayName,
        },
      },
    })) || [];

  const subspaces = useSubspacesSorted(rawSubspaces, sortMode);

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

  const [updateSubspacePinned] = useUpdateSubspacePinnedMutation();
  const [updateSubspacesSortOrder] = useUpdateSubspacesSortOrderMutation();

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

  const handleTogglePin = (subspaceId: string, currentlyPinned: boolean) => {
    updateSubspacePinned({
      variables: {
        pinnedData: {
          spaceID: spaceId,
          subspaceID: subspaceId,
          pinned: !currentlyPinned,
        },
      },
    });
  };

  const getSubSpaceActions = (item: SearchableListItem) => {
    const isPinned = subspaces.find(s => s.id === item.id)?.pinned ?? false;
    return (
      <>
        {sortMode === SpaceSortMode.Alphabetical && (
          <MenuItemWithIcon iconComponent={PushPinOutlinedIcon} onClick={() => handleTogglePin(item.id, isPinned)}>
            {isPinned
              ? t('pages.admin.space.sections.subspaces.unpinSpace')
              : t('pages.admin.space.sections.subspaces.pinSpace')}
          </MenuItemWithIcon>
        )}
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
  };

  const handleReorder = (subspaceIds: string[]) => {
    updateSubspacesSortOrder({
      variables: {
        spaceID: spaceId,
        subspaceIds: subspaceIds,
      },
    });
  };

  const onSubspaceCreated = (subspace: { about: { profile: { url: string } } }) => {
    notify(t('pages.admin.subsubspace.notifications.subsubspace-created'), 'success');
    navigate(buildSettingsUrl(subspace.about.profile.url));
  };

  if (loading || adminTemplatesLoading) return <Loading text={'Loading spaces'} />;
  return (
    <LayoutSwitcher currentTab={SettingsSection.Subspaces} tabRoutePrefix={routePrefix} useL0Layout={useL0Layout}>
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
                  setSelectedState(currentState => (currentState === state.displayName ? undefined : state.displayName))
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
          <Box display="flex" gap={1} justifyContent="flex-end" alignItems="center" marginBottom={2}>
            <SortModeDropdown spaceId={spaceId} currentSortMode={sortMode} />
            <Button
              startIcon={<AddOutlinedIcon />}
              variant="contained"
              onClick={() => setSubspaceCreationDialogOpen(true)}
            >
              {t('buttons.create')}
            </Button>
          </Box>
          <Gutters disablePadding={true}>
            <SubspacesSortableList
              subspaces={subspaces}
              sortMode={sortMode}
              getActions={getSubSpaceActions}
              getIndicator={item =>
                sortMode === SpaceSortMode.Alphabetical && subspaces.find(s => s.id === item.id)?.pinned ? (
                  <SubspacePinIndicator />
                ) : undefined
              }
              loading={loading}
              onReorder={handleReorder}
            />
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
          open={true}
          onClose={() => setSaveAsTemplateDialogSelectedSpace(undefined)}
          spaceId={saveAsTemplateDialogSelectedSpace.id}
          templatesSetId={templatesSet.id}
        />
      )}
    </LayoutSwitcher>
  );
};

export default SpaceAdminSubspacesPage;
