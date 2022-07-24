import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import { Button, DialogProps } from '@mui/material';
import SimpleCardsList from '../../shared/components/SimpleCardsList';
import React, { ComponentType, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateInfoFragment } from '../../../models/graphql-schema';
import { LinkWithState } from '../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import ConfirmationDialog from './ConfirmationDialog';
import { useApolloErrorHandler } from '../../../hooks';
import { Identifiable } from '../../shared/types/Identifiable';
import { SimpleCardProps } from '../../shared/components/SimpleCard';
import * as Apollo from '@apollo/client';
import { MutationTuple } from '@apollo/client/react/types/types';

interface Template extends Identifiable {
  info: TemplateInfoFragment;
}

interface CreateTemplateDialogProps<SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
}

interface EditTemplateDialogProps<T extends Template, SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
  onDelete: () => void;
  template: T | undefined;
}

interface TemplatePreviewProps<T extends Template> {
  template: T;
  open: boolean;
  onClose: DialogProps['onClose'];
  editUrl: string;
  editLinkState?: Record<string, unknown>;
}

export interface MutationHook<Variables, MutationResult> {
  (baseOptions?: Apollo.MutationHookOptions<MutationResult, Variables>): MutationTuple<MutationResult, Variables>;
}

interface AdminAspectTemplatesSectionProps<T extends Template, SubmittedValues extends {}, CreateM, UpdateM, DeleteM> {
  headerText: string;
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: T[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: T) => LinkWithState;
  edit?: boolean;
  templateCardComponent: ComponentType<Omit<SimpleCardProps, 'iconComponent'>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T>>;
  createTemplateDialogComponent: ComponentType<CreateTemplateDialogProps<SubmittedValues>>;
  editTemplateDialogComponent: ComponentType<EditTemplateDialogProps<T, SubmittedValues>>;
  useCreateTemplateMutation: MutationHook<SubmittedValues & { templatesSetId: string }, CreateM>;
  useUpdateTemplateMutation: MutationHook<Partial<SubmittedValues> & { templateId: string }, UpdateM>;
  useDeleteTemplateMutation: MutationHook<{ templateId: string }, DeleteM>;
}

const AdminTemplatesSection = <T extends Template, SubmittedValues extends {}, CreateM, UpdateM, DeleteM>({
  headerText,
  templates,
  templateId,
  templatesSetId,
  buildTemplateLink,
  onCloseTemplateDialog,
  refetchQueries,
  edit = false,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  templateCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  createTemplateDialogComponent: CreateTemplateDialog,
  editTemplateDialogComponent: EditTemplateDialog,
}: AdminAspectTemplatesSectionProps<T, SubmittedValues, CreateM, UpdateM, DeleteM>) => {
  const onError = useApolloErrorHandler();
  const { t } = useTranslation();

  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);

  const openCreateTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(true), []);
  const closeCreateAspectTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(false), []);

  const [deletingTemplateId, setDeletingTemplateId] = useState<string>();

  const [updateAspectTemplate] = useUpdateTemplateMutation({ onError });
  const [createAspectTemplate] = useCreateTemplateMutation({ onError });
  const [deleteAspectTemplate, { loading: isDeletingAspectTemplate }] = useDeleteTemplateMutation({ onError });

  const handleTemplateUpdate = async (values: SubmittedValues) => {
    if (!templateId) {
      throw new TypeError('Missing Template ID.');
    }

    await updateAspectTemplate({
      variables: {
        templateId,
        ...values,
      },
      refetchQueries,
    });

    onCloseTemplateDialog();
  };

  const handleAspectTemplateCreation = async (values: SubmittedValues) => {
    if (!templatesSetId) {
      throw new TypeError('TemplatesSet ID not loaded.');
    }

    await createAspectTemplate({
      variables: {
        templatesSetId,
        ...values,
      },
      refetchQueries,
    });
    closeCreateAspectTemplateDialog();
  };

  const selectedTemplate = templateId ? templates?.find(({ id }) => id === templateId) : undefined;
  const deletingTemplate = deletingTemplateId ? templates?.find(({ id }) => id === deletingTemplateId) : undefined;

  const buildTemplateEditLink = (template: T) => {
    const viewLink = buildTemplateLink(template);
    return {
      editUrl: `${viewLink.url}/edit`,
      editLinkState: viewLink.linkState,
    };
  };

  const handleAspectTemplateDeletion = async () => {
    if (!deletingTemplateId) {
      throw new TypeError('Missing Template ID.');
    }

    await deleteAspectTemplate({
      variables: {
        templateId: deletingTemplateId,
      },
      refetchQueries,
    });

    setDeletingTemplateId(undefined);
  };

  return (
    <>
      <DashboardGenericSection
        headerText={headerText}
        primaryAction={
          <Button variant="outlined" onClick={openCreateTemplateDialog}>
            {t('common.create-new')}
          </Button>
        }
      >
        <SimpleCardsList>
          {templates?.map(template => (
            <TemplateCard
              key={template.id}
              title={template.info.title}
              imageUrl={template.info.visual?.uri}
              {...buildTemplateLink(template)}
            />
          ))}
        </SimpleCardsList>
      </DashboardGenericSection>
      <CreateTemplateDialog
        open={isCreateTemplateDialogOpen}
        onClose={closeCreateAspectTemplateDialog}
        onSubmit={handleAspectTemplateCreation}
      />
      {selectedTemplate && (
        <EditTemplateDialog
          open={edit}
          onClose={onCloseTemplateDialog}
          template={selectedTemplate}
          onSubmit={handleTemplateUpdate}
          onDelete={() => setDeletingTemplateId(selectedTemplate.id)}
        />
      )}
      {selectedTemplate && (
        <TemplatePreview
          open={!edit}
          template={selectedTemplate}
          onClose={onCloseTemplateDialog}
          {...buildTemplateEditLink(selectedTemplate)}
        />
      )}
      {deletingTemplateId && (
        <ConfirmationDialog
          open={!!deletingTemplateId}
          title={t('common.warning')}
          loading={isDeletingAspectTemplate}
          onClose={() => setDeletingTemplateId(undefined)}
          onConfirm={handleAspectTemplateDeletion}
        >
          {t('pages.admin.generic.sections.templates.delete-confirmation', {
            template: deletingTemplate?.info.title,
          })}
        </ConfirmationDialog>
      )}
    </>
  );
};

export default AdminTemplatesSection;
