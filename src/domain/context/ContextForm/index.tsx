import { Formik } from 'formik';
import React, { FC } from 'react';
import * as yup from 'yup';
import { Context } from '../../../models/graphql-schema';
import { JourneyType } from '../../challenge/JourneyType';
import { ContextSegment, contextSegmentSchema } from '../../platform/admin/components/Common/ContextSegment';

export interface ContextFormValues {
  background: string;
  impact: string;
  vision: string;
  who: string;
}

interface Props {
  context?: Context;
  onSubmit: (formData: ContextFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  journeyType: JourneyType;
}

export const ContextForm: FC<Props> = ({ context, onSubmit, wireSubmit, journeyType }) => {
  const initialValues: ContextFormValues = {
    background: context?.background || '',
    impact: context?.impact || '',
    vision: context?.vision || '',
    who: context?.who || '',
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

        return <ContextSegment contextType={journeyType} />;
      }}
    </Formik>
  );
};
