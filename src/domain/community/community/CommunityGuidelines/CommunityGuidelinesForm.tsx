import { useState } from 'react';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import Gutters from '@/core/ui/grid/Gutters';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import LoadingButton from '@mui/lab/LoadingButton';
import ProfileReferenceSegment from '@/domain/platform/admin/components/Common/ProfileReferenceSegment';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';

type CommunityGuidelinesFormProps = {
  data: FormValues | undefined;
  profileId: string | undefined;
  onSubmit: (values: FormValues) => void;
  loading?: boolean;
  disabled?: boolean;
  deleteCommunityGuidelinesLoading?: boolean;
  hasDeleteContentButton?: boolean;
  onDeleteCommunityGuidelines?: () => void;
};

type FormValues = {
  displayName: string;
  description: string | undefined;
  references: {
    id: string;
    name: string;
    description?: string;
    uri: string;
  }[];
};

const validationSchema = yup.object().shape({
  displayName: yup.string().required(),
  description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  references: referenceSegmentSchema,
});

const CommunityGuidelinesForm = ({
  data,
  profileId,
  onSubmit,
  disabled,
  loading,
  hasDeleteContentButton = false,
  deleteCommunityGuidelinesLoading,
  onDeleteCommunityGuidelines,
}: CommunityGuidelinesFormProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { t } = useTranslation();

  const initialValues: FormValues = {
    displayName: data?.displayName ?? '',
    description: data?.description ?? '',
    references: data?.references ?? [],
  };

  return (
    <>
      <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
        {({ values, handleSubmit, isValid }) => {
          return (
            <Gutters>
              <FormikInputField
                name="displayName"
                title={t('common.title')}
                placeholder={t('common.title')}
                disabled={disabled || loading}
              />

              <FormikMarkdownField
                title={t('common.introduction')}
                name="description"
                disabled={disabled || loading}
                maxLength={MARKDOWN_TEXT_LENGTH}
              />

              <ProfileReferenceSegment references={values.references} profileId={profileId} />

              <Box display="flex" marginY={4} gap={1} justifyContent="flex-end">
                {hasDeleteContentButton && (
                  <LoadingButton
                    loading={loading}
                    variant="outlined"
                    disabled={!isValid}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    {t('common.deleteCommunityGuidelines')}
                  </LoadingButton>
                )}

                <LoadingButton disabled={!isValid} variant="contained" onClick={() => handleSubmit()} loading={loading}>
                  {t('common.update')}
                </LoadingButton>
              </Box>
            </Gutters>
          );
        }}
      </Formik>

      <ConfirmationDialog
        entities={{
          titleId: 'community.removeGuidelinesConfirmationDialog.title',
          contentId: 'community.removeGuidelinesConfirmationDialog.content',
          confirmButtonTextId: 'buttons.delete',
        }}
        options={{
          show: deleteDialogOpen,
        }}
        actions={{
          onConfirm: () => {
            onDeleteCommunityGuidelines?.();
            setDeleteDialogOpen(false);
          },
          onCancel: () => setDeleteDialogOpen(false),
        }}
        state={{
          isLoading: Boolean(deleteCommunityGuidelinesLoading),
        }}
      />
    </>
  );
};

export default CommunityGuidelinesForm;
