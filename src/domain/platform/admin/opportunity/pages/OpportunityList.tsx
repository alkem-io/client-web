import React, { FC, useCallback, useState } from 'react';

import useNavigate from '@core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchableList, { SearchableListItem } from '../../components/SearchableList';
import Loading from '@core/ui/loading/Loading';
import { useNotification } from '@core/ui/notifications/useNotification';
import { useSpace } from '../../../../journey/space/SpaceContext/useSpace';
import { useSubSpace } from '../../../../journey/subspace/hooks/useSubSpace';
import { useUrlParams } from '@core/routing/useUrlParams';
import { JourneyCreationDialog } from '../../../../shared/components/JorneyCreationDialog';
import { CreateOpportunityForm } from '../../../../journey/opportunity/forms/CreateOpportunityForm';
import { buildSettingsUrl } from '@main/routing/urlBuilders';
import { JourneyFormValues } from '../../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import { OpportunityIcon } from '../../../../journey/opportunity/icon/OpportunityIcon';
import {
  refetchSubspacesInSpaceQuery,
  useCreateSubspaceMutation,
  useDeleteSpaceMutation,
  useSpaceCollaborationIdLazyQuery,
  useSubspacesInSpaceQuery,
} from '@core/apollo/generated/apollo-hooks';
import { ContentCopyOutlined, DeleteOutline, DownloadForOfflineOutlined } from '@mui/icons-material';
import MenuItemWithIcon from '@core/ui/menu/MenuItemWithIcon';
import EntityConfirmDeleteDialog from '../../../../journey/space/pages/SpaceSettings/EntityConfirmDeleteDialog';
import Gutters from '@core/ui/grid/Gutters';
import { useCreateCollaborationTemplate } from '../../../../templates/hooks/useCreateCollaborationTemplate';
import { CollaborationTemplateFormSubmittedValues } from '../../../../templates/components/Forms/CollaborationTemplateForm';
import CreateTemplateDialog from '../../../../templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { TemplateType } from '@core/apollo/generated/graphql-schema';

export const OpportunityList: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { spaceNameId } = useSpace();
  const { subspaceId } = useSubSpace();
  const { challengeNameId = '' } = useUrlParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [saveAsTemplateDialogSelectedItem, setSaveAsTemplateDialogSelectedItem] = useState<SearchableListItem>();
  const [deleteDialogSelectedItem, setDeleteDialogSelectedItem] = useState<SearchableListItem>();

  const [fetchCollaborationId] = useSpaceCollaborationIdLazyQuery();

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
              addTutorialCallouts: value.addTutorialCallouts,
              addCallouts: value.addCallouts,
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

  const { handleCreateCollaborationTemplate } = useCreateCollaborationTemplate();
  const handleSaveAsTemplate = async (values: CollaborationTemplateFormSubmittedValues) => {
    await handleCreateCollaborationTemplate(values, spaceNameId);
    notify(t('pages.admin.subspace.notifications.templateSaved'), 'success');
    setSaveAsTemplateDialogSelectedItem(undefined);
  };

  const onDeleteConfirmation = () => {
    if (deleteDialogSelectedItem) {
      handleDelete(deleteDialogSelectedItem);
      setDeleteDialogSelectedItem(undefined);
    }
  };

  const onDuplicateClick = (_item: SearchableListItem) => {
    // todo: implement
    //setSelectedItem(item);
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

  const getActions = (item: SearchableListItem) => (
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
