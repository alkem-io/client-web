import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Box, Button, DialogProps } from '@mui/material';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import React, { ComponentType, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateInfoFragment } from '../../../../models/graphql-schema';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import ConfirmationDialog from './ConfirmationDialog';
import { useApolloErrorHandler, useNotification, useUserContext } from '../../../../hooks';
import { Identifiable } from '../../../shared/types/Identifiable';
import { SimpleCardProps } from '../../../shared/components/SimpleCard';
import * as Apollo from '@apollo/client';
import { MutationTuple } from '@apollo/client/react/types/types';
import { InnovationPack, TemplateFromInnovationPack } from './InnovationPacks/InnovationPack';
import { LibraryIcon } from '../../../../common/icons/LibraryIcon';
import ImportTemplatesDialog from './InnovationPacks/ImportTemplatesDialog';
import { TemplateImportCardComponentProps } from './InnovationPacks/ImportTemplatesDialogGalleryStep';
import TemplateViewDialog from './TemplateViewDialog';

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
}

export interface MutationHook<Variables, MutationResult> {
  (baseOptions?: Apollo.MutationHookOptions<MutationResult, Variables>): MutationTuple<MutationResult, Variables>;
}

type AdminAspectTemplatesSectionProps<
  T extends Template,
  Q extends T & TemplateFromInnovationPack,
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
  importDialogHeaderText: string;
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
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T>>;
  createTemplateDialogComponent: ComponentType<DialogProps & CreateTemplateDialogProps<SubmittedValues>>;
  editTemplateDialogComponent: ComponentType<DialogProps & EditTemplateDialogProps<T, SubmittedValues>>;
  useCreateTemplateMutation: MutationHook<SubmittedValues & { templatesSetId: string }, CreateM>;
  useUpdateTemplateMutation: MutationHook<Partial<SubmittedValues> & { templateId: string }, UpdateM>;
  useDeleteTemplateMutation: MutationHook<{ templateId: string; templatesSetId?: string }, DeleteM>;
};

const AdminTemplatesSection = <
  T extends Template,
  Q extends T & TemplateFromInnovationPack,
  SubmittedValues extends {},
  CreateM,
  UpdateM,
  DeleteM,
  DialogProps extends {}
>({
  headerText,
  importDialogHeaderText,
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
  templateImportCardComponent: TemplateImportCard,
  templatePreviewComponent: TemplatePreview,
  createTemplateDialogComponent,
  editTemplateDialogComponent,
  ...dialogProps
}: AdminAspectTemplatesSectionProps<T, Q, SubmittedValues, CreateM, UpdateM, DeleteM, DialogProps>) => {
  const CreateTemplateDialog = createTemplateDialogComponent as ComponentType<
    CreateTemplateDialogProps<SubmittedValues>
  >;
  const EditTemplateDialog = editTemplateDialogComponent as ComponentType<EditTemplateDialogProps<T, SubmittedValues>>;

  const onError = useApolloErrorHandler();
  const { t } = useTranslation();
  const notify = useNotification();

  const { user: userMetadata } = useUserContext();
  const userIsPlatformAdmin = userMetadata?.permissions.isPlatformAdmin;

  const [isCreateTemplateDialogOpen, setCreateTemplateDialogOpen] = useState(false);
  const [isImportTemplatesDialogOpen, setImportTemplatesDialogOpen] = useState(false);

  const openCreateTemplateDialog = useCallback(() => setCreateTemplateDialogOpen(true), []);
  const openImportTemplateDialog = useCallback(() => {
    loadInnovationPacks();
    setImportTemplatesDialogOpen(true);
  }, [loadInnovationPacks]);
  const closeCreateTemplateDialog = useCallback(() => setCreateTemplateDialogOpen(false), []);
  const closeImportTemplatesDialog = useCallback(() => setImportTemplatesDialogOpen(false), []);

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

  const handleImportTemplate = async (template: T) => {
    if (!templatesSetId) {
      throw new TypeError('TemplatesSet ID not loaded.');
    }

    // Deconstruct and rebuild template information from the InnovationPack template downloaded:
    const { id, info, ...templateData } = template;
    const { id: infoId, ...infoData } = info;
    const values: SubmittedValues = {
      ...(templateData as any),
      info: {
        title: infoData.title,
        tags: infoData.tagset?.tags,
        description: infoData.description,
      },
    };

    const result = await createAspectTemplate({
      variables: {
        templatesSetId,
        ...values,
      },
      refetchQueries,
    });

    if (!result.errors) {
      notify(t('pages.admin.generic.sections.templates.import.imported-successfully-notification'), 'success');
    }
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
        templatesSetId: templatesSetId!,
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
                onClick={openImportTemplateDialog}
                sx={{ marginRight: theme => theme.spacing(1) }}
                startIcon={<LibraryIcon />}
              >
                {t('buttons.library')}
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
        headerText={importDialogHeaderText}
        templateImportCardComponent={TemplateImportCard}
        templatePreviewComponent={TemplatePreview}
        open={isImportTemplatesDialogOpen}
        onClose={closeImportTemplatesDialog}
        onImportTemplate={handleImportTemplate}
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
        <TemplateViewDialog
          open={!edit}
          template={selectedTemplate}
          onClose={onCloseTemplateDialog}
          {...buildTemplateEditLink(selectedTemplate)}
        >
          <TemplatePreview template={selectedTemplate} />
        </TemplateViewDialog>
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
