import { Box, Button, Skeleton } from '@mui/material';
import { useField } from 'formik';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, Text } from '@/core/ui/typography';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import { TemplateDefaultType, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useSpaceDefaultTemplateQuery, useTemplateNameQuery } from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';

interface SubspaceTemplateSelectorProps extends GuttersProps {
  name: string;
}

export const SubspaceTemplateSelector: FC<SubspaceTemplateSelectorProps> = ({ name, ...rest }) => {
  const { t } = useTranslation();
  const { spaceId, loading: loadingSpace } = useSpace();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [field, , helpers] = useField<String>(name);

  const templateId: string | undefined = typeof field.value === 'string' ? field.value : undefined;

  const { data: templateData, loading: loadingTemplate } = useTemplateNameQuery({
    variables: { templateId: templateId! },
    skip: !templateId,
  });

  const { data: defaultSpaceTemplateData, loading: loadingSpaceTemplate } = useSpaceDefaultTemplateQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const templateName = useMemo(() => {
    const selectedTemplate = templateData?.lookup.template?.profile.displayName;
    const defaultSpaceTemplate = defaultSpaceTemplateData?.lookup.space?.templatesManager?.templateDefaults.find(
      templateDefault => templateDefault.type === TemplateDefaultType.SpaceSubspace
    )?.template?.profile.displayName;
    const defaultPlatformTemplate = t('context.subspace.template.defaultTemplate');
    return selectedTemplate ?? defaultSpaceTemplate ?? defaultPlatformTemplate;
  }, [templateId, templateData, defaultSpaceTemplateData, t]);

  const handleSelectTemplate = async ({ id: templateId }: Identifiable): Promise<void> => {
    helpers.setValue(templateId);
    setDialogOpen(false);
  };

  const loading = loadingSpace || loadingTemplate || loadingSpaceTemplate;

  return (
    <Gutters row alignItems="center" {...rest}>
      <BlockSectionTitle>{t('context.subspace.template.title')}</BlockSectionTitle>
      {loading ? <Skeleton width="100%" /> : <Text>{templateName}</Text>}
      <Box sx={{ marginLeft: 'auto' }}>
        <Button onClick={() => setDialogOpen(true)} startIcon={<LibraryIcon />} variant="outlined">
          {t('buttons.change-template')}
        </Button>
        <ImportTemplatesDialog
          templateType={TemplateType.Collaboration}
          actionButton={
            <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
              {t('buttons.use')}
            </LoadingButton>
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
