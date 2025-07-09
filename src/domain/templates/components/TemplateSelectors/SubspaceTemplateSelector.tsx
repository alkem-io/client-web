import { Box, Button, Chip, Skeleton } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import { SpaceLevel, TemplateDefaultType, TemplateType, VisualType } from '@/core/apollo/generated/graphql-schema';
import {
  useSpaceDefaultTemplatesQuery,
  useTemplateNameQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { VisualModel } from '@/domain/common/visual/model/VisualModel';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';

export type BasicVisualUrlModel = {
  avatar?: string;
  cardBanner?: string;
};

interface SubspaceTemplateSelectorProps extends GuttersProps {
  name: string;
  onTemplateVisualsLoaded?: (visualUrls: BasicVisualUrlModel) => void;
}

const getVisualUrls = (visuals: VisualModel[]): BasicVisualUrlModel => {
  const avatar: string | undefined = getVisualByType(VisualType.Avatar, visuals)?.uri;
  const cardBanner: string | undefined = getVisualByType(VisualType.Card, visuals)?.uri;

  return {
    ...(avatar && { avatar }),
    ...(cardBanner && { cardBanner }),
  };
};

export const SubspaceTemplateSelector: FC<SubspaceTemplateSelectorProps> = ({
  name,
  onTemplateVisualsLoaded,
  ...rest
}) => {
  const { t } = useTranslation();
  const { spaceId, loading: loadingSpace } = useUrlResolver();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [importTemplateConfirmOpen, setImportTemplateConfirmOpen] = useState(false);
  const [field, , helpers] = useField<string>(name);
  const { setFieldValue, validateForm, dirty } = useFormikContext();

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
    const defaultSpaceTemplate = defaultSpaceTemplatesData?.lookup.space?.templatesManager?.templateDefaults.find(
      templateDefault => templateDefault.type === TemplateDefaultType.SpaceSubspace
    )?.template?.profile.displayName;

    return defaultSpaceTemplate ?? t(`context.${SpaceLevel.L1}.template.defaultTemplate`);
  }, [defaultSpaceTemplatesData, t]);

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
        await setFieldValue('displayName', profile.displayName);
        // make sure the submit is enabled if displayName is set
        await validateForm();
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

      if (profile?.visuals) {
        onTemplateVisualsLoaded?.(getVisualUrls(profile.visuals));
      }

      setDialogOpen(false);
    }
  };

  const handleRemoveTemplate = (): void => {
    // reset the template field and the visuals
    helpers.setValue('');
    onTemplateVisualsLoaded?.(getVisualUrls([]));
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

  const loading = loadingSpace || loadingTemplate || loadingSpaceTemplate;

  return (
    <Gutters row alignItems="center" {...rest}>
      {loading && <Skeleton width="100%" />}
      {!loading && templateName !== defaultTemplateName && (
        <>
          <BlockSectionTitle>{t(`context.${SpaceLevel.L1}.template.title`)}</BlockSectionTitle>
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
          actionButton={
            <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
              {t('buttons.use')}
            </Button>
          }
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

export default SubspaceTemplateSelector;
