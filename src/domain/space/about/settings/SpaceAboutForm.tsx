import { Formik } from 'formik';
import { ElementType } from 'react';
import * as yup from 'yup';
import { ContextSegmentProps, spaceAboutSegmentSchema } from '@/domain/platform/admin/components/Common/ContextSegment';
import { SpaceAboutDetailsModel } from '../model/SpaceAboutFull.model';

export interface SpaceAboutFormValues {
  description: string;
  why: string;
  who: string;
}

type SpaceAboutFormProps = {
  about?: SpaceAboutDetailsModel;
  onSubmit: (formData: SpaceAboutFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  contextSegment: ElementType<ContextSegmentProps>;
  loading: boolean;
};

export const SpaceAboutForm = ({
  about,
  onSubmit,
  wireSubmit,
  loading,
  contextSegment: ContextSegment,
}: SpaceAboutFormProps) => {
  const initialValues: SpaceAboutFormValues = {
    description: about?.profile?.description || '',
    why: about?.why || '',
    who: about?.who || '',
  };

  const validationSchema = yup.object().shape({
    description: spaceAboutSegmentSchema.fields?.description || yup.string(),
    why: spaceAboutSegmentSchema.fields?.why || yup.string(),
    who: spaceAboutSegmentSchema.fields?.who || yup.string(),
  });

  let isSubmitWired = false;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        onSubmit(values);
      }}
    >
      {({ handleSubmit }) => {
        // TODO [ATS]: Research useImperativeHandle and useRef to achieve this.
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return <ContextSegment loading={loading} />;
      }}
    </Formik>
  );
};
