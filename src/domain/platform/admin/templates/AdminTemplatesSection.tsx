import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Box, Button, DialogProps } from '@mui/material';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import React, { ComponentType, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateInfoFragment } from '../../../../models/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import ConfirmationDialog from './ConfirmationDialog';
import { useApolloErrorHandler, useUserContext } from '../../../../hooks';
import { Identifiable } from '../../../shared/types/Identifiable';
import { SimpleCardProps } from '../../../shared/components/SimpleCard';
import * as Apollo from '@apollo/client';
import { MutationTuple } from '@apollo/client/react/types/types';
import ImportTemplatesDialog from './InnovationPacks/ImportTemplatesDialog';
import { InnovationPack, InnovationPackTemplatesData } from './InnovationPacks/InnovationPack';

export interface Template extends Identifiable {
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

export interface TemplatePreviewProps<T extends Template> {
  template: T;
  open: boolean;
  onClose: DialogProps['onClose'];
  editUrl?: string;
  editLinkState?: Record<string, unknown>;
}

export interface MutationHook<Variables, MutationResult> {
  (baseOptions?: Apollo.MutationHookOptions<MutationResult, Variables>): MutationTuple<MutationResult, Variables>;
}

type AdminAspectTemplatesSectionProps<
  T extends Template,
  SubmittedValues extends {},
  CreateM,
  UpdateM,
  DeleteM,
  DialogProps extends {}
> = Omit<
  DialogProps,
  keyof CreateTemplateDialogProps<SubmittedValues> | keyof EditTemplateDialogProps<T, SubmittedValues>
> & {
  headerText: string;
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: T[] | undefined;
  onCloseTemplateDialog: () => void;
  refetchQueries: InternalRefetchQueriesInclude;
  buildTemplateLink: (aspect: T) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  innovationPacks: InnovationPack[];
  templateCardComponent: ComponentType<Omit<SimpleCardProps, 'iconComponent'>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T>>;
  createTemplateDialogComponent: ComponentType<DialogProps & CreateTemplateDialogProps<SubmittedValues>>;
  editTemplateDialogComponent: ComponentType<DialogProps & EditTemplateDialogProps<T, SubmittedValues>>;
  useCreateTemplateMutation: MutationHook<SubmittedValues & { templatesSetId: string }, CreateM>;
  useUpdateTemplateMutation: MutationHook<Partial<SubmittedValues> & { templateId: string }, UpdateM>;
  useDeleteTemplateMutation: MutationHook<any, DeleteM>;  //!! TODO: { templateId: string, templatesSetId?: string }
};

const AdminTemplatesSection = <
  T extends Template,
  SubmittedValues extends {},
  CreateM,
  UpdateM,
  DeleteM,
  DialogProps extends {}
>({
  headerText,
  templates,
  templateId,
  templatesSetId,
  buildTemplateLink,
  onCloseTemplateDialog,
  refetchQueries,
  edit = false,
  loadInnovationPacks,
  innovationPacks,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  templateCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  createTemplateDialogComponent,
  editTemplateDialogComponent,
  ...dialogProps
}: AdminAspectTemplatesSectionProps<T, SubmittedValues, CreateM, UpdateM, DeleteM, DialogProps>) => {
  const CreateTemplateDialog = createTemplateDialogComponent as ComponentType<
    CreateTemplateDialogProps<SubmittedValues>
  >;
  const EditTemplateDialog = editTemplateDialogComponent as ComponentType<EditTemplateDialogProps<T, SubmittedValues>>;

  const onError = useApolloErrorHandler();
  const { t } = useTranslation();

  const { user: userMetadata } = useUserContext();
  const userIsPlatformAdmin = userMetadata?.permissions.isPlatformAdmin;

  const [isCreateTemplateDialogOpen, setIsCreateTemplateDialogOpen] = useState(false);
  const [isImportTemplatesDialogOpen, setIsImportTemplatesDialogOpen] = useState(false);

  const openCreateTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(true), []);
  const openImportTemplateDialog = useCallback(() => { loadInnovationPacks(); setIsImportTemplatesDialogOpen(true); }, [loadInnovationPacks]);
  const closeCreateTemplateDialog = useCallback(() => setIsCreateTemplateDialogOpen(false), []);
  const closeImportTemplatesDialog = useCallback(() => setIsImportTemplatesDialogOpen(false), []);

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
    closeCreateTemplateDialog();
  };

  const handleImportTemplate = async (template: InnovationPackTemplatesData) => {
    if (!templatesSetId) {
      throw new TypeError('TemplatesSet ID not loaded.');
    }

    // Deconstruct and rebuild template information from the InnovationPack template downloaded:
    const { id, info, ...templateData} = template;
    const { id: infoId, ...infoData } = info;
    const values: SubmittedValues = {
      ...templateData as any,
      info: {
        title: infoData.title,
        tags: infoData.tagset?.tags,
        description: infoData.description,
      }
    };

    await createAspectTemplate({
      variables: {
        templatesSetId,
        ...values,
      },
      refetchQueries,
    });
    closeImportTemplatesDialog();
  };

  const selectedTemplate = templateId ? templates?.find(({ id }) => id === templateId) : undefined;
  const deletingTemplate = deletingTemplateId ? templates?.find(({ id }) => id === deletingTemplateId) : undefined;

  const buildTemplateEditLink = (template: T) => {
    const viewLink = buildTemplateLink(template);
    return {
      editUrl: `${viewLink.to}/edit`,
      editLinkState: viewLink.state,
    };
  };

  const handleAspectTemplateDeletion = async () => {
    if (!deletingTemplateId) {
      throw new TypeError('Missing Template ID.');
    }

    await deleteAspectTemplate({
      variables: {
        templateId: deletingTemplateId,
        templatesSetId: templatesSetId!
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
          <Box>
            {userIsPlatformAdmin && (
              <Button
                variant="outlined"
                onClick={openImportTemplateDialog}
                sx={{ marginRight: theme => theme.spacing(1) }}
              >
                {t('buttons.import')}
              </Button>
            )}
            &nbsp;
            <Button variant="outlined" onClick={openCreateTemplateDialog}>
              {t('common.create-new')}
            </Button>
          </Box>
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
        {...dialogProps}
        open={isCreateTemplateDialogOpen}
        onClose={closeCreateTemplateDialog}
        onSubmit={handleAspectTemplateCreation}
      />
      <ImportTemplatesDialog
        {...dialogProps}
        open={isImportTemplatesDialogOpen}
        onClose={closeImportTemplatesDialog}
        onSelectTemplate={handleImportTemplate}
        innovationPacks={innovationPacks}
      />
      {selectedTemplate && (
        <EditTemplateDialog
          {...dialogProps}
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
