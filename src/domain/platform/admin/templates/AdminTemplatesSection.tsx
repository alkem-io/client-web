import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { Box, Button, DialogProps } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import SimpleCardsList from '../../../shared/components/SimpleCardsList';
import React, { ComponentType, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { SimpleCardProps } from '../../../shared/components/SimpleCard';
import * as Apollo from '@apollo/client';
import { MutationTuple } from '@apollo/client/react/types/types';
import { InnovationPack } from './InnovationPacks/InnovationPack';
import { LibraryIcon } from '../../../collaboration/templates/LibraryIcon';
import ImportTemplatesDialog from './InnovationPacks/ImportTemplatesDialog';
import {
  TemplateImportCardComponentProps,
  TemplateWithInnovationPack,
} from './InnovationPacks/ImportTemplatesDialogGalleryStep';
import TemplateViewDialog from './TemplateViewDialog';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { UpdateProfileInput } from '../../../../core/apollo/generated/graphql-schema';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { WhiteboardPreviewImage } from '../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import { TemplateBase } from '../../../collaboration/templates/CollaborationTemplatesLibrary/TemplateBase';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { GraphQLError } from 'graphql';

/**
 * @deprecated TODO remove
 */
export interface Template extends TemplateBase {}

interface CreateTemplateDialogProps<SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
}

interface EditTemplateDialogProps<T extends Template, V extends T, SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
  onDelete: () => void;
  template: T | undefined;
  getTemplateValue: (template: T) => void;
  templateValue: V | undefined;
}

export interface TemplatePreviewProps<T extends Template, V extends T> {
  template: T;
  getTemplateContent: (template: T) => void;
  templateContent: V | undefined;
}

export interface MutationHook<Variables, MutationResult> {
  (baseOptions?: Apollo.MutationHookOptions<MutationResult, Variables>): MutationTuple<MutationResult, Variables>;
}

export interface ProfileUpdate {
  profile: UpdateProfileInput;
}

type MutationResult<Data> = Promise<{
  data?: Data | null;
  errors?: readonly GraphQLError[];
}>;

type AdminTemplatesSectionProps<
  T extends Template,
  V extends T,
  // TODO There must be either introduced a minimal common subtype between the received and submitted values,
  // so that that one in not constructed from the other by removing fields, OR
  // the received and the submitted values may be two independent types.
  SubmittedValues extends Omit<T, 'profile'> & Omit<V, 'id'>,
  TemplateCreationResult,
  TemplateUpdateResult,
  DialogProps extends {}
> = Omit<
  DialogProps,
  keyof CreateTemplateDialogProps<SubmittedValues> | keyof EditTemplateDialogProps<T, V, SubmittedValues>
> & {
  headerText: string;
  importDialogHeaderText: string;
  templateId: string | undefined;
  templatesSetId: string | undefined;
  templates: (T & Identifiable)[] | undefined;
  onCloseTemplateDialog: () => void;
  buildTemplateLink: (post: T) => LinkWithState;
  edit?: boolean;
  loadInnovationPacks: () => void;
  loadingInnovationPacks?: boolean;
  canImportTemplates: boolean;
  innovationPacks: InnovationPack<T>[];
  templateCardComponent: ComponentType<Omit<SimpleCardProps, 'iconComponent'>>;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<T>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T, V>>;
  getWhiteboardTemplateContent?: (template: T) => void;
  getImportedWhiteboardTemplateContent?: (template: TemplateWithInnovationPack<T>) => void;
  whiteboardTemplateContent?: V | undefined;
  importedTemplateContent?: V | undefined;
  createTemplateDialogComponent: ComponentType<DialogProps & CreateTemplateDialogProps<SubmittedValues>>;
  editTemplateDialogComponent: ComponentType<
    DialogProps & EditTemplateDialogProps<T, V, SubmittedValues & { tags?: string[]; tagsetId: string | undefined }>
  >;
  onCreateTemplate: (template: SubmittedValues & { templatesSetId: string }) => MutationResult<TemplateCreationResult>;
  onUpdateTemplate: (
    template: Partial<SubmittedValues> & ProfileUpdate & { templateId: string }
  ) => MutationResult<TemplateUpdateResult>;
  onDeleteTemplate: (template: { templateId: string; templatesSetId?: string }) => Promise<void>;
  onTemplateCreated?: (
    mutationResult: TemplateCreationResult | null | undefined,
    previewImages?: WhiteboardPreviewImage[]
  ) => void;
  onTemplateUpdated?: (
    mutationResult: TemplateUpdateResult | null | undefined,
    previewImages?: WhiteboardPreviewImage[]
  ) => void;
};

const AdminTemplatesSection = <
  T extends Template,
  // Q extends T & TemplateInnovationPackMetaInfo,
  V extends T,
  SubmittedValues extends Omit<T, 'profile'> & Omit<V, 'id'>,
  CreateM,
  UpdateM,
  DialogProps extends {}
>({
  headerText,
  importDialogHeaderText,
  templates,
  templateId,
  templatesSetId,
  buildTemplateLink,
  onCloseTemplateDialog,
  edit = false,
  loadInnovationPacks,
  loadingInnovationPacks,
  innovationPacks,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onTemplateCreated,
  onTemplateUpdated,
  templateCardComponent: TemplateCard,
  templateImportCardComponent: TemplateImportCard,
  templatePreviewComponent: TemplatePreview,
  createTemplateDialogComponent,
  editTemplateDialogComponent,
  canImportTemplates,
  // Some Templates (Post, InnovationFlow...) come with the value included, and some others (Whiteboards) need to call this function to retrieve the data
  getWhiteboardTemplateContent = () => {},
  getImportedWhiteboardTemplateContent = () => {},
  ...dialogProps
}: AdminTemplatesSectionProps<T, V, SubmittedValues, CreateM, UpdateM, DialogProps>) => {
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

  const handleTemplateUpdate = async ({
    tagsetId,
    tags,
    ...values
  }: SubmittedValues & { tags?: string[]; tagsetId: string | undefined } & {
    previewImages?: WhiteboardPreviewImage[];
  }) => {
    if (!templateId) {
      throw new TypeError('Missing Template ID.');
    }

    const { previewImages, ...valuesWithoutPreview } = values;

    const result = await onUpdateTemplate({
      templateId,
      ...(valuesWithoutPreview as unknown as SubmittedValues),
      profile: {
        tagsets: [
          {
            ID: tagsetId,
            tags,
          },
        ],
        ...valuesWithoutPreview['profile'],
      },
    });

    onTemplateUpdated?.(result.data, previewImages);
    onCloseTemplateDialog();
  };

  const handleTemplateCreation = async (
    values: SubmittedValues & {
      previewImages?: WhiteboardPreviewImage[];
    }
  ) => {
    if (!templatesSetId) {
      throw new TypeError('TemplatesSet ID not loaded.');
    }

    const { previewImages, ...valuesWithoutPreview } = values;

    const result = await onCreateTemplate({
      templatesSetId,
      ...(valuesWithoutPreview as unknown as SubmittedValues),
    });

    onTemplateCreated?.(result.data, previewImages);
    closeCreateTemplateDialog();
  };

  const handleImportTemplate = async (template: T & Identifiable, value: V | undefined) => {
    if (!templatesSetId) {
      throw new TypeError('TemplatesSet ID not loaded.');
    }

    // Deconstruct and rebuild template information from the InnovationPack template downloaded:
    const { id, profile, ...templateData } = template;

    const values: SubmittedValues = {
      ...(templateData as unknown as SubmittedValues), // TODO check type overlap
      ...value,
      profile: {
        displayName: profile.displayName,
        description: profile.description,
      },
      tags: profile.tagset?.tags,
    };

    const result = await onCreateTemplate({
      templatesSetId,
      ...values,
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

  const [handleTemplateDeletion, isDeletingTemplate] = useLoadingState(async () => {
    if (!deletingTemplateId) {
      throw new TypeError('Missing Template ID.');
    }

    if (!templatesSetId) {
      throw new TypeError('No TemplateSet ID provided');
    }

    await onDeleteTemplate({
      templateId: deletingTemplateId,
      templatesSetId: templatesSetId,
    });

    setDeletingTemplateId(undefined);
  });

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
                {t('common.library')}
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
        onSubmit={handleTemplateCreation}
      />
      <ImportTemplatesDialog
        {...dialogProps}
        headerText={importDialogHeaderText}
        dialogSubtitle={t('pages.admin.generic.sections.templates.import.subtitle')}
        templateImportCardComponent={TemplateImportCard}
        templatePreviewComponent={TemplatePreview}
        getImportedTemplateContent={getImportedWhiteboardTemplateContent}
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
          getTemplateValue={getWhiteboardTemplateContent}
          templateValue={dialogProps.whiteboardTemplateContent}
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
            getTemplateContent={getWhiteboardTemplateContent}
            templateContent={dialogProps.whiteboardTemplateContent}
          />
        </TemplateViewDialog>
      )}
      {deletingTemplateId && (
        <ConfirmationDialog
          actions={{
            onConfirm: handleTemplateDeletion,
            onCancel: () => setDeletingTemplateId(undefined),
          }}
          options={{
            show: Boolean(deletingTemplateId),
          }}
          entities={{
            titleId: 'common.warning',
            content: t('pages.admin.generic.sections.templates.delete-confirmation', {
              template: deletingTemplate?.profile.displayName,
            }),
            confirmButtonTextId: 'buttons.delete',
          }}
          state={{
            isLoading: isDeletingTemplate,
          }}
        />
      )}
    </>
  );
};

export default AdminTemplatesSection;
