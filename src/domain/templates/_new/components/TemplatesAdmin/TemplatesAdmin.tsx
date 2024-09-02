import React, { FC, useMemo, useState } from 'react';
import TemplatesGalleryContainer from '../TemplatesGallery/TemplatesGalleryContainer';
import TemplatesGallery from '../TemplatesGallery/TemplatesGallery';
import { useAllTemplatesInTemplatesSetQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import { useTranslation } from 'react-i18next';
import EditTemplateDialog from '../Dialogs/EditTemplateDialog/EditTemplateDialog';
import useNavigate from '../../../../../core/routing/useNavigate';
import { AnyTemplate } from '../../models/TemplateBase';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import { TemplateFormSubmittedValues } from '../Forms/TemplateForm';
import useBackToPath from '../../../../../core/routing/useBackToPath';

interface TemplatesAdminProps {
  templatesSetId: string | undefined;
  templateId?: string;  // Template selected, if any
  baseUrl: string | undefined;
  canImportTemplates?: boolean;

  onDeleteTemplate?: (template: { templateId: string }) => Promise<void>;
}

const TemplatesAdmin: FC<TemplatesAdminProps> = ({
  templatesSetId,
  templateId,
  baseUrl = '',
  canImportTemplates = false,
  onDeleteTemplate,
}) => {
  const { t } = useTranslation();
  const backToTemplates = useBackToPath();

  const [deletingTemplate, setDeletingTemplate] = useState<AnyTemplate>();
  const [handleTemplateDeletion, isDeletingTemplate] = useLoadingState(async () => {
    if (!deletingTemplate) {
      throw new TypeError('Missing Template to delete ID.');
    }
    if (!onDeleteTemplate) {
      throw new TypeError('Cannot delete template in this form');
    }

    await onDeleteTemplate({
      templateId: deletingTemplate.id,
    });

    setDeletingTemplate(undefined);
  });

  const { data, loading, refetch } = useAllTemplatesInTemplatesSetQuery({
    variables: { templatesSetId: templatesSetId! },
    skip: !templatesSetId,
  });

  const {
    postTemplates,
    whiteboardTemplates,
    innovationFlowTemplates,
    calloutTemplates,
    communityGuidelinesTemplates
  } = data?.lookup.templatesSet ?? {};

  const selectedTemplate = useMemo<AnyTemplate | undefined>(() => {
    if (!templateId) return undefined;
    return [
      ...postTemplates ?? [],
      ...whiteboardTemplates ?? [],
      ...innovationFlowTemplates ?? [],
      ...communityGuidelinesTemplates ?? [],
      ...calloutTemplates ?? [],
    ].find(template => template.id === templateId);
  }, [templateId, data?.lookup.templatesSet])

  const handleTemplateUpdate = async (values: TemplateFormSubmittedValues) => {
    //!!
    return Promise.resolve();
  };

  return (
    <>
      <PageContentBlockSeamless disablePadding >
        <TemplatesGalleryContainer
          templates={postTemplates}
          templatesSetId={templatesSetId}
          baseUrl={baseUrl}
        >
          {provided => (
            <TemplatesGallery
              headerText={t('common.enums.templateTypes.Post')}
              {...provided}
            />
          )}
        </TemplatesGalleryContainer>
      </PageContentBlockSeamless>
      ... More template types
      {selectedTemplate && (
        <EditTemplateDialog
          open
          onClose={() => backToTemplates(`${baseUrl}/settings`)}
          template={selectedTemplate}
          templateType={selectedTemplate.type}
          onSubmit={handleTemplateUpdate}
          onDelete={() => setDeletingTemplate(selectedTemplate)}
        />
      )}
      {deletingTemplate && (
        <ConfirmationDialog
          actions={{
            onConfirm: handleTemplateDeletion,
            onCancel: () => setDeletingTemplate(undefined),
          }}
          options={{
            show: Boolean(deletingTemplate),
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

export default TemplatesAdmin;