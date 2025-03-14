import React, { FC, useCallback, useState } from 'react';

import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchableList, { SearchableListItem } from '@/domain/platform/admin/components/SearchableList';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useSpace } from '@/domain/space/SpaceContext/useSpace';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { JourneyCreationDialog } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationDialog';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { JourneyFormValues } from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationForm';
import { OpportunityIcon } from '@/domain/journey/opportunity/icon/OpportunityIcon';
import {
  refetchAdminSpaceSubspacesPageQuery,
  refetchSpaceDashboardNavigationSubspacesQuery,
  refetchSubspacesInSpaceQuery,
  useDeleteSpaceMutation,
  useSpaceCollaborationIdLazyQuery,
  useSpaceTemplatesManagerQuery,
  useSubspacesInSpaceQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import EntityConfirmDeleteDialog from '@/domain/journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import Gutters from '@/core/ui/grid/Gutters';
import { useCreateCollaborationTemplate } from '@/domain/templates/hooks/useCreateCollaborationTemplate';
import { CollaborationTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/CollaborationTemplateForm';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { AuthorizationPrivilege, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { CreateSubspaceForm } from '@/domain/journey/subspace/forms/CreateSubspaceForm';
import { useSubspaceCreation } from '@/domain/shared/utils/useSubspaceCreation/useSubspaceCreation';

export const OpportunityList: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [saveAsTemplateDialogSelectedItem, setSaveAsTemplateDialogSelectedItem] = useState<SearchableListItem>();
  const [deleteDialogSelectedItem, setDeleteDialogSelectedItem] = useState<SearchableListItem>();
  const spaceId = space?.id!;

  const [fetchCollaborationId] = useSpaceCollaborationIdLazyQuery();

  const { data: subspacesListQuery, loading } = useSubspacesInSpaceQuery({
    variables: { spaceId: subspace.id },
    skip: !subspace.id,
  });

  const subsubspaces =
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

  const [deleteOpportunity] = useDeleteSpaceMutation({
    refetchQueries: [
      refetchSubspacesInSpaceQuery({
        spaceId,
      }),
      refetchAdminSpaceSubspacesPageQuery({
        spaceId,
      }),
      refetchSpaceDashboardNavigationSubspacesQuery({
        spaceId,
      }),
    ],
    awaitRefetchQueries: true,
    onCompleted: () => notify(t('pages.admin.subsubspace.notifications.subsubspace-removed'), 'success'),
  });

  const handleDelete = (item: SearchableListItem) => {
    return deleteOpportunity({
      variables: {
        spaceId: item.id,
      },
    });
  };

  const { createSubspace } = useSubspaceCreation({
    onCompleted: () => {
      notify(t('pages.admin.subsubspace.notifications.subsubspace-created'), 'success');
    },
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId: subspace.id })],
    awaitRefetchQueries: true,
  });

  const handleCreate = useCallback(
    async (value: JourneyFormValues) => {
      const result = await createSubspace({
        spaceID: subspace.id,
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
        collaborationTemplateId: value.collaborationTemplateId,
      });

      if (!result?.about.profile?.url) {
        notify(t('pages.admin.subsubspace.notifications.error-creating-subsubspace'), 'error');
        return;
      }
      navigate(buildSettingsUrl(result.about.profile.url));
    },
    [navigate, createSubspace, subspace.id]
  );

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

  const onDeleteConfirmation = () => {
    if (deleteDialogSelectedItem) {
      handleDelete(deleteDialogSelectedItem);
      setDeleteDialogSelectedItem(undefined);
    }
  };

  // const onDuplicateClick = (_item: SearchableListItem) => {
  //   // todo: implement
  //   //setSelectedItem(item);
  // };

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

  const getActions = (item: SearchableListItem) => (
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
          <SearchableList data={subsubspaces} getActions={getActions} />
        </Gutters>
      </Box>
      <JourneyCreationDialog
        open={open}
        icon={<OpportunityIcon />}
        journeyName={t('common.subspace')}
        onClose={() => setOpen(false)}
        onCreate={handleCreate}
        formComponent={CreateSubspaceForm}
      />
      <EntityConfirmDeleteDialog
        entity={t('common.subsubspace')}
        open={!!deleteDialogSelectedItem}
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

export default OpportunityList;
