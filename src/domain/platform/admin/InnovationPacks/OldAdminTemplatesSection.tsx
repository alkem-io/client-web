import { Button, DialogProps } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import React, { ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkWithState } from '../../../shared/types/LinkWithState';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { InnovationPack } from './InnovationPack';
import ImportTemplatesDialog from '../../../templates/_new/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateImportCardComponentProps, TemplateWithInnovationPack } from '../../../templates/_new/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialogGallery';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { TemplateType, UpdateProfileInput } from '../../../../core/apollo/generated/graphql-schema';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { WhiteboardPreviewImage } from '../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { GraphQLError } from 'graphql';
import { Link } from 'react-router-dom';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { TemplateBase } from '../../../templates/library/CollaborationTemplatesLibrary/TemplateBase';
import PreviewTemplateDialog, {
  PreviewTemplateDialogProps,
} from '../../../templates/_new/components/Dialogs/PreviewTemplateDialog/PreviewTemplateDialog';
import { LibraryIcon } from '../../../templates/LibraryIcon';
import { CARLOS_BORDER_RED } from '../../../templates/_new/borders';

/**
 * @deprecated TODO remove
 */
export interface Template extends TemplateBase {}

interface CreateTemplateDialogProps<SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
}

interface EditTemplateDialogProps<T extends TemplateBase, V extends T, SubmittedValues extends {}> {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: SubmittedValues) => void;
  onDelete: () => void;
  template: T | undefined;
  getTemplateContent: (template: T) => void;
  templateContent: V | undefined;
}

export interface ProfileUpdate {
  profile: UpdateProfileInput;
}

type MutationResult<Data> = Promise<{
  data?: Data | null;
  errors?: readonly GraphQLError[];
}>;

type AdminTemplatesSectionProps<
  T extends TemplateBase,
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
  headerText: string; //
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
  templateCardComponent: ComponentType<TemplateImportCardComponentProps<T>>;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<T>>;
  getWhiteboardTemplateContent?: (template: T) => void;
  getImportedWhiteboardTemplateContent?: (template: TemplateWithInnovationPack<T>) => void;
  whiteboardTemplateContent?: V | undefined;
  importedTemplateContent?: V | undefined;
  createTemplateDialogComponent: ComponentType<DialogProps & CreateTemplateDialogProps<SubmittedValues>> | undefined;
  editTemplateDialogComponent:
    | ComponentType<
        DialogProps & EditTemplateDialogProps<T, V, SubmittedValues & { tags?: string[]; tagsetId: string | undefined }>
      >
    | undefined;
  onCreateTemplate: (template: SubmittedValues & { templatesSetId: string }) => MutationResult<TemplateCreationResult>;
  onUpdateTemplate: (
    template: Partial<SubmittedValues> & ProfileUpdate & { templateId: string }
  ) => MutationResult<TemplateUpdateResult>;
  onDeleteTemplate: (template: { templateId: string; templatesSetId?: string }) => Promise<unknown>;
  // On templateImport is a callback that allows to modify the template before it is imported (for example, for callout templates we need to load the template content)
  onTemplateImport?: (template: T & Identifiable) => Promise<T & Identifiable>;
  onTemplateCreated?: (
    mutationResult: TemplateCreationResult | null | undefined,
    previewImages?: WhiteboardPreviewImage[]
  ) => void;
  onTemplateUpdated?: (
    mutationResult: TemplateUpdateResult | null | undefined,
    previewImages?: WhiteboardPreviewImage[]
  ) => void;
  templateType: TemplateType;
};
/**
 * @deprecated WE REALLY WANT TO REMOVE THIS FILE
 */
const AdminTemplatesSection = <
  T extends TemplateBase,
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
  createTemplateDialogComponent,
  editTemplateDialogComponent,
  canImportTemplates,
  // Some Templates (Post, InnovationFlow...) come with the value included, and some others (Whiteboards) need to call this function to retrieve the data
  getWhiteboardTemplateContent = () => {},
  getImportedWhiteboardTemplateContent = () => {},
  onTemplateImport = t => Promise.resolve(t as unknown as T & Identifiable),
  templateType,
  ...dialogProps
}: AdminTemplatesSectionProps<T, V, SubmittedValues, CreateM, UpdateM, DialogProps>) => {
  const CreateTemplateDialog = (createTemplateDialogComponent ?? (() => null)) as ComponentType<
    CreateTemplateDialogProps<SubmittedValues>
  >;
  const EditTemplateDialog = (editTemplateDialogComponent ?? (() => null)) as ComponentType<
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
    const templateImported = await onTemplateImport(template);

    // Deconstruct and rebuild template information from the InnovationPack template downloaded:
    const { id, profile, ...templateData } = templateImported;

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

  const editTemplateButton = useMemo(() => {
    if (!editTemplateDialogComponent || !selectedTemplate) {
      return;
    }

    const { to, state } = buildTemplateLink(selectedTemplate);

    return (
      <Button component={Link} variant="contained" to={`${to}/edit`} state={state}>
        {t('common.update')}
      </Button>
    );
  }, [selectedTemplate, buildTemplateLink, editTemplateDialogComponent]);

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

  const templateWithValue = useMemo(() => {
    if (!selectedTemplate) {
      return undefined;
    }

    const template =
      templateType === TemplateType.Whiteboard
        ? {
            ...selectedTemplate,
            ...(dialogProps.whiteboardTemplateContent as V),
          }
        : selectedTemplate;

    return template as unknown as V;
  }, [selectedTemplate, templateType]);

  const templatePreview = useMemo(() => {
    if (!templateWithValue) {
      return undefined;
    }

    return {
      template: templateWithValue,
      templateType,
    } as PreviewTemplateDialogProps['templatePreview'];
  }, [templateWithValue]);

  useEffect(() => {
    if (selectedTemplate && templateType === TemplateType.Whiteboard) {
      getWhiteboardTemplateContent(selectedTemplate);
    }
  }, [selectedTemplate, templateType, getWhiteboardTemplateContent]);

  return (
    <>
      <PageContentBlock sx={{ border: CARLOS_BORDER_RED }}>
        <PageContentBlockHeader
          title={headerText}
          actions={
            <>
              {canImportTemplates && (
                <Button onClick={openImportTemplateDialog} startIcon={<LibraryIcon />}>
                  {t('common.library')}
                </Button>
              )}
              {createTemplateDialogComponent && (
                <Button variant="outlined" onClick={openCreateTemplateDialog}>
                  {t('common.create-new')}
                </Button>
              )}
            </>
          }
        />
        <ScrollableCardsLayoutContainer>
          {templates?.map(template => (
            <TemplateCard key={template.id} template={template} {...buildTemplateLink(template)} />
          ))}
        </ScrollableCardsLayoutContainer>
      </PageContentBlock>
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
        getImportedTemplateContent={getImportedWhiteboardTemplateContent}
        open={isImportTemplatesDialogOpen}
        onClose={closeImportTemplatesDialog}
        onSelectTemplate={handleImportTemplate}
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
        templateType={templateType}
      />
      {selectedTemplate && edit && (
        <EditTemplateDialog
          {...dialogProps}
          open
          onClose={onCloseTemplateDialog}
          template={selectedTemplate}
          onSubmit={handleTemplateUpdate}
          onDelete={() => setDeletingTemplateId(selectedTemplate.id)}
          getTemplateContent={getWhiteboardTemplateContent}
          templateContent={dialogProps.whiteboardTemplateContent}
        />
      )}
      {selectedTemplate && !edit && (
        <PreviewTemplateDialog
          open
          onClose={onCloseTemplateDialog}
          templatePreview={templatePreview}
          actions={editTemplateButton}
        />
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
