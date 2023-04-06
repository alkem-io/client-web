import React, { FC, useCallback, useMemo, useState } from 'react';
import { Grid, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import PostTemplatePreviewCard from './PostTemplateCardPreview';
import { useField } from 'formik';
import FormRow from '../../../../shared/layout/FormLayout/FormRow';
import { Caption, CardText } from '../../../../../core/ui/typography';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { LONG_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { LibraryIcon } from '../../../../../common/icons/LibraryIcon';
import ImportTemplatesDialog from '../../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialog';
import { useInnovationPacksLazyQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import AspectImportTemplateCard from '../../../../platform/admin/templates/PostTemplates/PostImportTemplateCard';

interface PostTemplatesChooserProps {
  name: string;
  // templates: PostTemplateFragment[];
  editMode?: boolean;
}

export type LibraryPostTemplate = {
  id: string;
  profile: {
    displayName: string;
  };
  defaultDescription: string;
  innovationPackId: string;
};

export const PostTemplatesChooser: FC<PostTemplatesChooserProps> = ({ name }) => {
  const [, , helpers] = useField(name);
  const [isImportTemplatesDialogOpen, setImportTemplatesDialogOpen] = useState(false);
  const { t } = useTranslation();

  const [loadInnovationPacks, { data: innovationPacks, loading: loadingInnovationPacks }] =
    useInnovationPacksLazyQuery();

  const openImportTemplateDialog = useCallback(() => {
    loadInnovationPacks();
    setImportTemplatesDialogOpen(true);
  }, [loadInnovationPacks]);
  const closeImportTemplatesDialog = useCallback(() => setImportTemplatesDialogOpen(false), []);

  const cardInnovationPacks = useMemo(() => {
    if (!innovationPacks) return [];
    return innovationPacks?.platform.library.innovationPacks
      .filter(pack => pack.templates && pack.templates?.postTemplates.length > 0)
      .map(pack => ({
        ...pack,
        templates: pack.templates?.postTemplates || [],
      }));
  }, [innovationPacks]);

  const handleImportTemplate = async (template: LibraryPostTemplate) => {
    helpers.setValue(template.defaultDescription);
    closeImportTemplatesDialog();
  };

  return (
    <>
      <FormRow>
        <Caption>{t('components.callout-creation.template-step.card-template-label')}</Caption>
        <CardText>{t('components.callout-creation.template-step.card-template-text')}</CardText>
        <Button
          onClick={openImportTemplateDialog}
          sx={{ marginRight: theme => theme.spacing(1) }}
          startIcon={<LibraryIcon />}
        >
          {t('buttons.find-template')}
        </Button>
        <SectionSpacer />
        <Grid container>
          <FormRow>
            <FormikMarkdownField
              name="postTemplateDefaultDescription"
              title={t('components.callout-creation.template-step.card-template-default-description')}
              maxLength={LONG_TEXT_LENGTH}
              withCounter
            />
          </FormRow>
        </Grid>
      </FormRow>
      <ImportTemplatesDialog
        headerText={t('pages.admin.generic.sections.templates.import.title', {
          templateType: t('common.post'),
        })}
        loading={loadingInnovationPacks}
        dialogSubtitle={t('pages.admin.generic.sections.templates.import.callout-template-import-subtitle')}
        templateImportCardComponent={AspectImportTemplateCard}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        templatePreviewComponent={PostTemplatePreviewCard as any}
        open={isImportTemplatesDialogOpen}
        onClose={closeImportTemplatesDialog}
        onImportTemplate={handleImportTemplate}
        innovationPacks={cardInnovationPacks}
        actionButton={
          <Button startIcon={<CheckIcon />} variant="contained" sx={{ marginLeft: theme => theme.spacing(1) }}>
            {t('buttons.select')}
          </Button>
        }
      />
    </>
  );
};

export default PostTemplatesChooser;
