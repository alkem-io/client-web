import { Box, Button, Chip, Skeleton, Tooltip } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import TemplateActionButton from '../Buttons/TemplateActionButton';
import { SpaceLevel, TemplateDefaultType, TemplateType } from '@/core/apollo/generated/graphql-schema';
import {
  useSpaceDefaultTemplatesQuery,
  useTemplateNameQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { EntityVisualUrls, getVisualUrls } from '@/domain/common/visual/utils/visuals.utils';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { SpaceTemplate } from '../../models/SpaceTemplate';

interface SpaceTemplateSelectorProps extends GuttersProps {
  /**
   * Formik field name for the template Id
   */
  name: string;
  /**
   * Optional, defaults to SpaceLevel.L0. Used to determine which default template to use the Space or the Subspace, and to show a few labels
   * There is no distinction between Space and Subspace templates in the backend
   */
  level?: SpaceLevel;
  /**
   * Callback to tell the parent component to update the visuals taking the ones coming in the template
   */
  onTemplateVisualsLoaded?: (visualUrls: EntityVisualUrls) => void;

  isTemplateSelectable?: (template: SpaceTemplate) => boolean;
}

export const SpaceTemplateSelector: FC<SpaceTemplateSelectorProps> = ({
  name,
  level = SpaceLevel.L0,
  onTemplateVisualsLoaded,
  isTemplateSelectable,
  ...rest
}) => {
  const { t } = useTranslation();
  const { spaceId } = useUrlResolver();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [importTemplateConfirmOpen, setImportTemplateConfirmOpen] = useState(false);
  const [field, , helpers] = useField<string>(name);
  const { getFieldProps, setFieldValue, validateForm, dirty } = useFormikContext();

  const templateId: string | undefined = typeof field.value === 'string' ? field.value : undefined;

  const { data: templateData, loading: loadingTemplate } = useTemplateNameQuery({
    variables: { templateId: templateId! },
    skip: !templateId,
  });

  const { data: defaultSpaceTemplatesData, loading: loadingSpaceTemplate } = useSpaceDefaultTemplatesQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const [getTemplateContent] = useTemplateContentLazyQuery();

  const defaultTemplateName = useMemo(() => {
    const defaultTemplateType =
      level === SpaceLevel.L0 ? TemplateDefaultType.PlatformSpace : TemplateDefaultType.SpaceSubspace;
    const defaultSpaceTemplate = defaultSpaceTemplatesData?.lookup.space?.templatesManager?.templateDefaults.find(
      templateDefault => templateDefault.type === defaultTemplateType
    )?.template?.profile.displayName;

    return defaultSpaceTemplate ?? t(`context.${level}.template.defaultTemplate`);
  }, [defaultSpaceTemplatesData, t, level]);

  const templateName = useMemo(() => {
    return templateData?.lookup.template?.profile.displayName ?? defaultTemplateName;
  }, [templateData, defaultTemplateName, t]);

  // Fetch template content with space data and populate the form
  const handleSelectTemplate = async ({ id: templateId }: Identifiable): Promise<void> => {
    const { data } = await getTemplateContent({
      variables: {
        templateId,
        includeSpace: true,
      },
    });

    const profile = data?.lookup.template?.contentSpace?.about?.profile;

    if (profile) {
      helpers.setValue(templateId);

      if (profile.displayName) {
        const currentValue = getFieldProps('displayName').value;
        if (!currentValue) {
          await setFieldValue('displayName', profile.displayName);
          // make sure the submit is enabled if displayName is set
          await validateForm();
        }
      }
      if (profile.tagline) {
        setFieldValue('tagline', profile.tagline);
      }
      if (profile.description) {
        setFieldValue('description', profile.description);
      }
      if (profile?.tagsets?.[0]?.tags) {
        setFieldValue('tags', profile.tagsets[0].tags);
      }

      if (profile?.cardBanner) {
        onTemplateVisualsLoaded?.(getVisualUrls([profile.cardBanner]));
      }

      setDialogOpen(false);
    }
  };

  const handleRemoveTemplate = (): void => {
    // reset the template field and the visuals
    helpers.setValue('');
    onTemplateVisualsLoaded?.({});
  };

  const handleImportTemplateClick = () => {
    if (!dirty) {
      setDialogOpen(true);
    } else {
      setImportTemplateConfirmOpen(true);
    }
  };

  const handleConfirmImportTemplate = () => {
    setImportTemplateConfirmOpen(false);
    setDialogOpen(true);
  };

  const loading = loadingTemplate || loadingSpaceTemplate;

  return (
    <Gutters row alignItems="center" {...rest}>
      {loading && <Skeleton width="100%" />}
      {!loading && templateName !== defaultTemplateName && (
        <>
          <BlockSectionTitle>{t(`context.${level}.template.title`)}</BlockSectionTitle>
          <Chip
            variant="filled"
            color="primary"
            label={<Caption variant="button">{templateName}</Caption>}
            onDelete={handleRemoveTemplate}
          />
        </>
      )}
      <Box sx={{ marginLeft: 'auto' }}>
        <Button
          onClick={handleImportTemplateClick}
          startIcon={<LibraryIcon />}
          variant="outlined"
          aria-label={t('buttons.change-template')}
        >
          {t('buttons.change-template')}
        </Button>
        <ImportTemplatesDialog
          templateType={TemplateType.Space}
          actionButton={template => {
            if (isTemplateSelectable && !isTemplateSelectable(template as SpaceTemplate)) {
              return (
                /* Keep it inside a react fragment <>...</> to disable the onClick handler that the dialog is adding*/
                <Tooltip title={t('createSpace.innovationFlowError')}>
                  <span>
                    <TemplateActionButton disabled />
                  </span>
                </Tooltip>
              );
            }
            return <TemplateActionButton />;
          }}
          open={isDialogOpen}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setDialogOpen(false)}
          enablePlatformTemplates
        />
        {/* Add confirmation dialog for overwriting form data */}
        {importTemplateConfirmOpen && (
          <ConfirmationDialog
            actions={{
              onConfirm: handleConfirmImportTemplate,
              onCancel: () => setImportTemplateConfirmOpen(false),
            }}
            options={{
              show: importTemplateConfirmOpen,
            }}
            entities={{
              titleId: 'callout.create.importTemplate.confirmOverwrite.title',
              contentId: 'callout.create.importTemplate.confirmOverwrite.content',
              confirmButtonTextId: 'buttons.yesContinue',
            }}
          />
        )}
      </Box>
    </Gutters>
  );
};

export default SpaceTemplateSelector;
