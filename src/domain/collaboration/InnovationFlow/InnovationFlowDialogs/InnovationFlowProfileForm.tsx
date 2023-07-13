import { Button } from '@mui/material';
import { Formik } from 'formik';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Reference, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { LONG_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import Gutters from '../../../../core/ui/grid/Gutters';
import ContextReferenceSegment from '../../../../domain/platform/admin/components/Common/ContextReferenceSegment';
import { referenceSegmentSchema } from '../../../../domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../../domain/platform/admin/components/Common/TagsetSegment';
import { InnovationFlowProfile } from './InnovationFlowProfileBlock';
import { Actions } from '../../../../core/ui/actions/Actions';
import VisualUpload from '../../../../core/ui/upload/VisualUpload/VisualUpload';

export interface InnovationFlowProfileFormValues {
  displayName: string;
  description: string;
  references: Reference[];
  tagsets: Tagset[];
}

interface InnovationFlowProfileFormProps {
  profile?: InnovationFlowProfile;
  onSubmit: (formData: InnovationFlowProfileFormValues) => void;
  onCancel?: () => void;
}

const InnovationFlowProfileForm: FC<InnovationFlowProfileFormProps> = ({ profile, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  const initialValues: InnovationFlowProfileFormValues = {
    displayName: profile?.displayName ?? '',
    description: profile?.description ?? '',
    references: profile?.references || [],
    tagsets: profile?.tagsets ?? [],
  };

  const validationSchema = yup.object().shape({
    displayName: yup.string().required().max(SMALL_TEXT_LENGTH),
    description: yup.string().required().max(LONG_TEXT_LENGTH),
    references: referenceSegmentSchema,
    tagsets: tagsetSegmentSchema,
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        onSubmit(values);
      }}
    >
      {({ values: { references }, handleSubmit }) => {
        return (
          <Gutters>
            <FormikInputField name="displayName" title={t('common.title')} maxLength={SMALL_TEXT_LENGTH} />
            <FormikMarkdownField
              name="description"
              title={t('common.description')}
              maxLength={LONG_TEXT_LENGTH}
              withCounter
            />
            <TagsetSegment tagsets={profile?.tagsets ?? []} />
            <ContextReferenceSegment references={references || []} profileId={profile?.id} />
            <VisualUpload visual={profile?.bannerNarrow} />
            <Actions justifyContent="end">
              <Button variant="text" onClick={onCancel}>
                {t('buttons.cancel')}
              </Button>
              <Button variant="contained" onClick={() => handleSubmit()}>
                {t('buttons.save')}
              </Button>
            </Actions>
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default InnovationFlowProfileForm;
