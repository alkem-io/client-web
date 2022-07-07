import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Button } from '@mui/material';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import AspectTemplateCard from './AspectTemplateCard';
import CreateAspectTemplateDialog from './CreateAspectTemplateDialog';
import EditAspectTemplateDialog from './EditAspectTemplateDialog';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateAspectTemplateMutation,
  useDeleteAspectTemplateMutation,
  useUpdateAspectTemplateMutation,
} from '../../../../hooks/generated/graphql';
import { AspectTemplateFormSubmittedValues } from './AspectTemplateForm';
import { AdminAspectTemplateFragment } from '../../../../models/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import AspectTemplateView from './AspectTemplateView';
import ConfirmationDialog from './ConfirmationDialog';
import { useApolloErrorHandler } from '../../../../hooks';

interface AdminAspectTemplatesSectionProps {
  aspectTemplateId: string | undefined;
  templatesSetId: string | undefined;
  aspectTemplates: AdminAspectTemplateFragment[] | undefined;
  onCloseAspectTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildAspectTemplateLink: (aspect: AdminAspectTemplateFragment) => LinkWithState;
  edit?: boolean;
}

const AdminAspectTemplatesSection = ({
  aspectTemplates,
  aspectTemplateId,
  templatesSetId,
  buildAspectTemplateLink,
  onCloseAspectTemplateDialog,
  refetchQueries,
  edit = false,
}: AdminAspectTemplatesSectionProps) => {
  const onError = useApolloErrorHandler();
  const { t } = useTranslation();

  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);

  const openCreateTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(true), []);
  const closeCreateAspectTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(false), []);

  const [deletingAspectTemplateId, setDeletingAspectTemplateId] = useState<string>();

  const [updateAspectTemplate] = useUpdateAspectTemplateMutation({ onError });
  const [createAspectTemplate] = useCreateAspectTemplateMutation({ onError });
  const [deleteAspectTemplate, { loading: isDeletingAspectTemplate }] = useDeleteAspectTemplateMutation({ onError });

  const handleAspectTemplateUpdate = async (values: AspectTemplateFormSubmittedValues) => {
    await updateAspectTemplate({
      variables: {
        aspectTemplateInput: {
          ID: aspectTemplateId!,
          ...values,
        },
      },
      refetchQueries,
    });
    onCloseAspectTemplateDialog();
  };

  const handleAspectTemplateCreation = async (values: AspectTemplateFormSubmittedValues) => {
    await createAspectTemplate({
      variables: {
        aspectTemplateInput: {
          templatesSetID: templatesSetId!,
          ...values,
        },
      },
      refetchQueries,
    });
    closeCreateAspectTemplateDialog();
  };

  const aspectTemplate = aspectTemplateId ? aspectTemplates?.find(({ id }) => id === aspectTemplateId) : undefined;
  const deletingAspectTemplate = deletingAspectTemplateId
    ? aspectTemplates?.find(({ id }) => id === deletingAspectTemplateId)
    : undefined;

  const buildAspectTemplateEditLink = (aspectTemplate: AdminAspectTemplateFragment) => {
    const viewLink = buildAspectTemplateLink(aspectTemplate);
    return {
      editUrl: `${viewLink.url}/edit`,
      editLinkState: viewLink.linkState,
    };
  };

  const handleAspectTemplateDeletion = async () => {
    if (!deletingAspectTemplateId) {
      throw new TypeError('Aspect template ID missing');
    }

    await deleteAspectTemplate({
      variables: {
        deleteData: {
          ID: deletingAspectTemplateId,
        },
      },
      refetchQueries,
    });

    setDeletingAspectTemplateId(undefined);
  };

  return (
    <>
      <DashboardGenericSection
        headerText={t('pages.admin.generic.sections.templates.aspect-templates')}
        primaryAction={
          <Button variant="outlined" onClick={openCreateTemplateDialog}>
            {t('common.create-new')}
          </Button>
        }
      >
        <SimpleCardsList>
          {aspectTemplates?.map(aspectTemplate => (
            <AspectTemplateCard
              key={aspectTemplate.id}
              title={aspectTemplate.info.title}
              imageUrl={aspectTemplate.info.visual?.uri}
              {...buildAspectTemplateLink(aspectTemplate)}
            />
          ))}
        </SimpleCardsList>
      </DashboardGenericSection>
      <CreateAspectTemplateDialog
        open={isCreateTemplateDialogOpen}
        onClose={closeCreateAspectTemplateDialog}
        onSubmit={handleAspectTemplateCreation}
      />
      {aspectTemplate && (
        <EditAspectTemplateDialog
          open={edit}
          onClose={onCloseAspectTemplateDialog}
          aspectTemplate={aspectTemplate}
          onSubmit={handleAspectTemplateUpdate}
          onDelete={() => setDeletingAspectTemplateId(aspectTemplate.id)}
        />
      )}
      {aspectTemplate && (
        <AspectTemplateView
          open={!edit}
          title={aspectTemplate.info.title!}
          visual={aspectTemplate.info.visual!}
          templateType={aspectTemplate.type}
          description={aspectTemplate.info.description!}
          defaultDescription={aspectTemplate.defaultDescription}
          tags={aspectTemplate.info.tagset?.tags}
          onClose={onCloseAspectTemplateDialog}
          {...buildAspectTemplateEditLink(aspectTemplate)}
        />
      )}
      {deletingAspectTemplateId && (
        <ConfirmationDialog
          open={!!deletingAspectTemplateId}
          title={t('common.warning')}
          loading={isDeletingAspectTemplate}
          onClose={() => setDeletingAspectTemplateId(undefined)}
          onConfirm={handleAspectTemplateDeletion}
        >
          {t('pages.admin.generic.sections.templates.delete-confirmation', {
            template: deletingAspectTemplate?.info.title,
          })}
        </ConfirmationDialog>
      )}
    </>
  );
};

export default AdminAspectTemplatesSection;
