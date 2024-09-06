import { Box, Button } from '@mui/material';
import { useField } from 'formik';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { Caption, CardText } from '../../../../../core/ui/typography';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { LibraryIcon } from '../../../LibraryIcon';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useImportTemplateDataLazyQuery,
  useSpaceTemplatesSetIdQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { Identifiable } from '../../../../../core/utils/Identifiable';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';

interface PostTemplatesSelectorProps {
  name: string;
}

export const PostTemplateSelector: FC<PostTemplatesSelectorProps> = ({ name }) => {
  //!! This could be better... and maybe it doesn't work on subspaces properly
  const { spaceNameId } = useUrlParams();
  const { data } = useSpaceTemplatesSetIdQuery({
    variables: {
      spaceNameId: spaceNameId!,
    },
    skip: !spaceNameId,
  });
  const templatesSetId = data?.space.library?.id;

  const { t } = useTranslation();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [, , helpers] = useField<String>(name);

  const [getTemplateData] = useImportTemplateDataLazyQuery();
  const handleSelectTemplate = async (template: Identifiable): Promise<void> => {
    const { data } = await getTemplateData({ variables: { templateId: template.id, includePost: true } });
    if (data?.lookup.template?.postDefaultDescription) {
      helpers.setValue(data?.lookup.template?.postDefaultDescription);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box>
          <Caption>{t('components.callout-creation.template-step.post-template-label')}</Caption>
          <CardText>{t('components.callout-creation.template-step.post-template-text')}</CardText>
        </Box>
        <Box sx={{ marginLeft: 'auto' }}>
          <Button onClick={() => setDialogOpen(true)} startIcon={<LibraryIcon />}>
            {t('buttons.find-template')}
          </Button>
          <ImportTemplatesDialog
            templateType={TemplateType.Post}
            templatesSetId={templatesSetId}
            actionButton={
              <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
                {t('buttons.use')}
              </LoadingButton>
            }
            open={isDialogOpen}
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setDialogOpen(false)}
          />
        </Box>
      </Box>
      <FormikMarkdownField
        name={`${name}`}
        title={t('components.callout-creation.template-step.post-template-default-description')}
        maxLength={MARKDOWN_TEXT_LENGTH}
      />
    </>
  );
};

export default PostTemplateSelector;
