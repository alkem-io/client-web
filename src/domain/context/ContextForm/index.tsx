import { ElementType } from 'react';

import * as yup from 'yup';
import { Formik } from 'formik';

import { Context, Profile } from '../../../core/apollo/generated/graphql-schema';
import { ContextSegmentProps, contextSegmentSchema } from '../../platform/admin/components/Common/ContextSegment';

export const ContextForm = ({
  context,
  profile,
  loading,
  onSubmit,
  wireSubmit,
  contextSegment: ContextSegment,
}: ContextFormProps) => {
  const initialValues: ContextFormValues = {
    who: context?.who || '',
    vision: context?.vision || '',
    impact: context?.impact || '',
    background: profile?.description || '',
  };

  const validationSchema = yup.object().shape({
    background: contextSegmentSchema.fields?.background || yup.string(),
    impact: contextSegmentSchema.fields?.impact || yup.string(),
    vision: contextSegmentSchema.fields?.vision || yup.string(),
    who: contextSegmentSchema.fields?.who || yup.string(),
  });

  let isSubmitWired = false;

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
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

export interface ContextFormValues {
  who: string;
  vision: string;
  impact: string;
  background: string;
}

interface ContextFormProps {
  loading: boolean;
  contextSegment: ElementType<ContextSegmentProps>;
  wireSubmit: (setter: () => void) => void;
  onSubmit: (formData: ContextFormValues) => void;
  context?: Context;
  profile?: Omit<Profile, 'storageBucket' | 'url'>;
}
