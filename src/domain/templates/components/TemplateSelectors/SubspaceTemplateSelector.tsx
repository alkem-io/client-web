import { Box, Button, Chip, Skeleton } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import { SpaceLevel, TemplateDefaultType, TemplateType } from '@/core/apollo/generated/graphql-schema';
import {
  useSpaceDefaultTemplatesQuery,
  useTemplateNameQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

interface SubspaceTemplateSelectorProps extends GuttersProps {
  name: string;
}

export const SubspaceTemplateSelector: FC<SubspaceTemplateSelectorProps> = ({ name, ...rest }) => {
  const { t } = useTranslation();
  const { spaceId, loading: loadingSpace } = useUrlResolver();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [field, , helpers] = useField<string>(name);
  const { setFieldValue } = useFormikContext();

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

  const handleSelectTemplate = async ({ id: templateId }: Identifiable): Promise<void> => {
    helpers.setValue(templateId);

    // Fetch template content with space data
    try {
      const { data } = await getTemplateContent({
        variables: {
          templateId,
          includeSpace: true,
        },
      });

      if (data?.lookup.template?.contentSpace) {
        const contentSpaceAbout = data.lookup.template?.contentSpace?.about;

        // Populate form fields with template data
        if (contentSpaceAbout?.profile) {
          if (contentSpaceAbout.profile.displayName) {
            setFieldValue('displayName', contentSpaceAbout?.profile.displayName);
          }
          if (contentSpaceAbout.profile.tagline) {
            setFieldValue('tagline', contentSpaceAbout?.profile.tagline);
          }
          if (contentSpaceAbout.profile.description) {
            setFieldValue('description', contentSpaceAbout?.profile.description);
          }
        }

        // Populate tags if available
        if (contentSpaceAbout?.profile?.tagsets?.[0]?.tags) {
          setFieldValue('tags', contentSpaceAbout?.profile.tagsets?.[0]?.tags);
        }
      }
    } catch (error) {
      console.error('Error fetching template content:', error);
    }

    setDialogOpen(false);
  };

  const handleRemoveTemplate = (): void => {
    helpers.setValue('');
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
          onClick={() => setDialogOpen(true)}
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
      </Box>
    </Gutters>
  );
};

export default SubspaceTemplateSelector;
