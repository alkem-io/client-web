import { Button } from '@mui/material';
import { Formik } from 'formik';
import { ComponentType, FC, Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Reference, Tagset } from '@/core/apollo/generated/graphql-schema';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { InnovationFlowProfile } from './InnovationFlowProfileBlock';
import { Actions } from '@/core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../shared/utils/useLoadingState';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';

export interface InnovationFlowProfileFormValues {
  displayName: string;
  description: string;
  references: Reference[];
  tagsets: Tagset[];
}

interface InnovationFlowProfileFormProps {
  profile?: InnovationFlowProfile;
  onSubmit: (formData: InnovationFlowProfileFormValues) => Promise<unknown> | void;
  onCancel?: () => void;
  actionsRenderer?: ComponentType<{ children: ReactElement }>;
}

const InnovationFlowProfileForm: FC<InnovationFlowProfileFormProps> = ({
  profile,
  onSubmit,
  onCancel,
  actionsRenderer: ActionsRenderer = Fragment,
}) => {
  const { t } = useTranslation();

  const initialValues: InnovationFlowProfileFormValues = {
    displayName: profile?.displayName ?? '',
    description: profile?.description ?? '',
    references: profile?.references || [],
    tagsets: profile?.tagsets ?? [],
  };

  const validationSchema = yup.object().shape({
    displayName: yup.string().required().max(SMALL_TEXT_LENGTH),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
    references: referenceSegmentSchema,
    tagsets: tagsetsSegmentSchema,
  });

  const [handleSave, loading] = useLoadingState(async (profileData: InnovationFlowProfileFormValues) => {
    await onSubmit(profileData);
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSave}>
      {({ /*values: { references },*/ handleSubmit }) => {
        return (
          <>
            <FormikInputField name="displayName" title={t('common.title')} maxLength={SMALL_TEXT_LENGTH} />
            <FormikMarkdownField name="description" title={t('common.description')} maxLength={MARKDOWN_TEXT_LENGTH} />
            {/* TODO: Tags pending <TagsetSegment tagsets={profile?.tagsets ?? []} /> */}
            {/* TODO: References are hidden: <ContextReferenceSegment references={references || []} profileId={profile?.id} /> */}
            {/* TODO: Visual is hidden <VisualUpload visual={profile?.bannerNarrow} /> */}
            <ActionsRenderer>
              <Actions justifyContent="end">
                <Button variant="text" onClick={onCancel}>
                  {t('buttons.cancel')}
                </Button>
                <LoadingButton loading={loading} variant="contained" onClick={() => handleSubmit()}>
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </ActionsRenderer>
          </>
        );
      }}
    </Formik>
  );
};

export default InnovationFlowProfileForm;
