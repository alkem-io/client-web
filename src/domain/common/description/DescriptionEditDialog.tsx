import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Button, DialogContent } from '@mui/material';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Formik } from 'formik';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { useMemo } from 'react';
import * as yup from 'yup';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { Actions } from '@/core/ui/actions/Actions';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

export type KnowledgeBaseProfileType = {
  description: string;
};

type DescriptionEditDialogProps = {
  description: string | undefined;
  onUpdate: (args: KnowledgeBaseProfileType) => Promise<void>;
  onClose: () => void;
};

export const DescriptionEditDialog = ({ description, onUpdate, onClose }: DescriptionEditDialogProps) => {
  const { t } = useTranslation();

  const initialValues: KnowledgeBaseProfileType = useMemo(
    () => ({
      description: description ?? '',
    }),
    [description]
  );

  const [onSave, loading] = useLoadingState(async (values: KnowledgeBaseProfileType) => onUpdate(values));

  const validationSchema = yup.object().shape({
    description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH, { required: true }),
  });

  return (
    <DialogWithGrid open aria-labelledby="description-dialog-title" onClose={onClose}>
      <DialogHeader id="description-dialog-title" onClose={onClose}>
        {t('buttons.edit')}
      </DialogHeader>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={onSave}
        >
          {({ handleSubmit, isValid }) => {
            return (
              <>
                <FormikMarkdownField
                  name="description"
                  title={t('components.post-creation.info-step.description')}
                  placeholder={t('components.post-creation.info-step.description-placeholder')}
                  rows={7}
                  required
                  maxLength={LONG_MARKDOWN_TEXT_LENGTH}
                />
                <Actions justifyContent="end">
                  <Button variant="text" onClick={onClose}>
                    {t('buttons.cancel')}
                  </Button>
                  <Button
                    loading={loading}
                    disabled={!isValid || loading}
                    variant="contained"
                    onClick={() => handleSubmit()}
                  >
                    {t('buttons.save')}
                  </Button>
                </Actions>
              </>
            );
          }}
        </Formik>
      </DialogContent>
    </DialogWithGrid>
  );
};
