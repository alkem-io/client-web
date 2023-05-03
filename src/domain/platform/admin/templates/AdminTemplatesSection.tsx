import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Box, Button, DialogProps } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import React, { ComponentType, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { InternalRefetchQueriesInclude } from '@apollo/client/core/types';
import ConfirmationDialog from './ConfirmationDialog';
import { Identifiable } from '../../../shared/types/Identifiable';
import { SimpleCardProps } from '../../../shared/components/SimpleCard';
import * as Apollo from '@apollo/client';
import { MutationTuple } from '@apollo/client/react/types/types';
import { InnovationPack, TemplateInnovationPackMetaInfo } from './InnovationPacks/InnovationPack';
import { LibraryIcon } from '../../../../common/icons/LibraryIcon';
import ImportTemplatesDialog from './InnovationPacks/ImportTemplatesDialog';
import { TemplateImportCardComponentProps } from './InnovationPacks/ImportTemplatesDialogGalleryStep';
import TemplateViewDialog from './TemplateViewDialog';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { ProfileInfoWithVisualFragment, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import DeleteButton from '../../../shared/components/DeleteButton';

export interface Template extends Identifiable {
  profile: ProfileInfoWithVisualFragment;
}

export interface TemplateValue {}

interface CreateTemplateDialogProps<SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
}

interface EditTemplateDialogProps<T extends Template, V extends TemplateValue, SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
  onDelete: () => void;
  template: T | undefined;
  getTemplateValue: (template: T) => void;
  templateValue: V | undefined;
}

export interface TemplatePreviewProps<T extends Template, V extends TemplateValue> {
  template: T;
  getTemplateValue: (template: T) => void;
  templateValue: V | undefined;
}

export interface MutationHook<Variables, MutationResult> {
  (baseOptions?: Apollo.MutationHookOptions<MutationResult, Variables>): MutationTuple<MutationResult, Variables>;
}

export interface ProfileUpdate {
  profile?: { tagsets?: Partial<Tagset>[] };
}

type AdminTemplatesSectionProps<
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue,
  // TODO There must be either introduced a minimal common subtype between the received and submitted values,
  // so that that one in not constructed from the other by removing fields, OR
  // the received and the submitted values may be two independent types.
  SubmittedValues extends Omit<T, 'id' | 'profile'> & Omit<V, 'id'>,
  CreateM,
  UpdateM,
  DeleteM,
  DialogProps extends {}
> = Omit<
  DialogProps,
  keyof CreateTemplateDialogProps<SubmittedValues> | keyof EditTemplateDialogProps<T, V, SubmittedValues>
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
  loadingInnovationPacks?: boolean;
  canImportTemplates: boolean;
  innovationPacks: InnovationPack<T>[];
  templateCardComponent: ComponentType<Omit<SimpleCardProps, 'iconComponent'>>;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T, V>>;
  getTemplateValue?: (template: T) => void;
  getImportedTemplateValue?: (template: Q) => void;
  templateValue?: V | undefined;
  importedTemplateValue?: V | undefined;
  createTemplateDialogComponent: ComponentType<DialogProps & CreateTemplateDialogProps<SubmittedValues>>;
  editTemplateDialogComponent: ComponentType<
    DialogProps & EditTemplateDialogProps<T, V, SubmittedValues & { tags?: string[]; tagsetId: string | undefined }>
  >;
  // TODO instead of mutations let's just pass callbacks - mutations have options which make the type too complicated for using in generics.
  useCreateTemplateMutation: MutationHook<SubmittedValues & { templatesSetId: string }, CreateM>;
  useUpdateTemplateMutation: MutationHook<Partial<SubmittedValues & ProfileUpdate> & { templateId: string }, UpdateM>;
  useDeleteTemplateMutation: MutationHook<{ templateId: string; templatesSetId?: string }, DeleteM>;
};

const AdminTemplatesSection = <
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue,
  SubmittedValues extends Omit<T, 'id' | 'profile'> & Omit<V, 'id'>,
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
  loadingInnovationPacks,
  innovationPacks,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  templateCardComponent: TemplateCard,
  templateImportCardComponent: TemplateImportCard,
  templatePreviewComponent: TemplatePreview,
  createTemplateDialogComponent,
  editTemplateDialogComponent,
  canImportTemplates,
  // Some Templates (Post, InnovationFlow...) come with the value included, and some others (Whiteboards) need to call this function to retrieve the data
  getTemplateValue = () => {},
  ...dialogProps
}: AdminTemplatesSectionProps<T, Q, V, SubmittedValues, CreateM, UpdateM, DeleteM, DialogProps>) => {
  const CreateTemplateDialog = createTemplateDialogComponent as ComponentType<
    CreateTemplateDialogProps<SubmittedValues>
  >;
  const EditTemplateDialog = editTemplateDialogComponent as ComponentType<
    EditTemplateDialogProps<T, V, SubmittedValues & { tags?: string[]; tagsetId: string | undefined }>
  >;

  const { t } = useTranslation();
  const notify = useNotification();

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

  const [updatePostTemplate] = useUpdateTemplateMutation();
  const [createPostTemplate] = useCreateTemplateMutation();
  const [deletePostTemplate, { loading: isDeletingPostTemplate }] = useDeleteTemplateMutation();

  const handleTemplateUpdate = async ({
    tagsetId,
    tags,
    ...values
  }: SubmittedValues & { tags?: string[]; tagsetId: string | undefined }) => {
    if (!templateId) {
      throw new TypeError('Missing Template ID.');
    }

    await updatePostTemplate({
      variables: {
        templateId,
        ...(values as unknown as SubmittedValues),
        profile: {
          tagsets: [
            {
              ID: tagsetId,
              tags,
            },
          ],
          ...values['profile'],
        },
      },
      refetchQueries,
    });

    onCloseTemplateDialog();
  };

  const handlePostTemplateCreation = async (values: SubmittedValues) => {
    if (!templatesSetId) {
      throw new TypeError('TemplatesSet ID not loaded.');
    }

    await createPostTemplate({
      variables: {
        templatesSetId,
        ...values,
      },
      refetchQueries,
    });
    closeCreateTemplateDialog();
  };

  const handleImportTemplate = async (template: T, value: V | undefined) => {
    if (!templatesSetId) {
      throw new TypeError('TemplatesSet ID not loaded.');
    }

    // Deconstruct and rebuild template information from the InnovationPack template downloaded:
    const { id, profile, ...templateData } = template;
    const { id: infoId, ...infoData } = profile;
    const values: SubmittedValues = {
      ...(templateData as SubmittedValues),
      ...value,
      profile: {
        displayName: infoData.displayName,
        description: infoData.description,
      },
      tags: infoData.tagset?.tags,
    };

    const result = await createPostTemplate({
      variables: {
        templatesSetId,
        ...values,
      },
      refetchQueries,
    });

    if (!result.errors) {
      notify(t('pages.admin.generic.sections.templates.import.imported-successfully-notification'), 'success');
    } else {
      throw result.errors;
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

  const handlePostTemplateDeletion = async () => {
    if (!deletingTemplateId) {
      throw new TypeError('Missing Template ID.');
    }

    await deletePostTemplate({
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
            {canImportTemplates && (
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
              title={template.profile.displayName}
              imageUrl={template.profile.visual?.uri}
              {...buildTemplateLink(template)}
            />
          ))}
        </SimpleCardsList>
      </DashboardGenericSection>
      <CreateTemplateDialog
        {...dialogProps}
        open={isCreateTemplateDialogOpen}
        onClose={closeCreateTemplateDialog}
        onSubmit={handlePostTemplateCreation}
      />
      <ImportTemplatesDialog
        {...dialogProps}
        headerText={importDialogHeaderText}
        dialogSubtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
        templateImportCardComponent={TemplateImportCard}
        templatePreviewComponent={TemplatePreview}
        open={isImportTemplatesDialogOpen}
        onClose={closeImportTemplatesDialog}
        onImportTemplate={handleImportTemplate}
        innovationPacks={innovationPacks}
        loading={loadingInnovationPacks}
        actionButton={
          <Button
            startIcon={<SystemUpdateAltIcon />}
            variant="contained"
            sx={{ marginLeft: theme => theme.spacing(1) }}
          >
            {t('buttons.import')}
          </Button>
        }
      />
      {selectedTemplate && (
        <EditTemplateDialog
          {...dialogProps}
          open={edit}
          onClose={onCloseTemplateDialog}
          template={selectedTemplate}
          onSubmit={handleTemplateUpdate}
          onDelete={() => setDeletingTemplateId(selectedTemplate.id)}
          getTemplateValue={getTemplateValue}
          templateValue={dialogProps.templateValue}
        />
      )}
      {selectedTemplate && (
        <TemplateViewDialog
          open={!edit}
          template={selectedTemplate}
          onClose={onCloseTemplateDialog}
          {...buildTemplateEditLink(selectedTemplate)}
        >
          <TemplatePreview
            template={selectedTemplate}
            getTemplateValue={getTemplateValue}
            templateValue={dialogProps.templateValue}
          />
        </TemplateViewDialog>
      )}
      {deletingTemplateId && (
        <ConfirmationDialog
          open={!!deletingTemplateId}
          title={t('common.warning')}
          loading={isDeletingPostTemplate}
          onClose={() => setDeletingTemplateId(undefined)}
          confirmButton={<DeleteButton onClick={handlePostTemplateDeletion} />}
        >
          {t('pages.admin.generic.sections.templates.delete-confirmation', {
            template: deletingTemplate?.profile.displayName,
          })}
        </ConfirmationDialog>
      )}
    </>
  );
};

export default AdminTemplatesSection;
