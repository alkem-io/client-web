import { Formik } from 'formik';
import React, { FC } from 'react';
import * as yup from 'yup';
import { Context, Profile } from '../../../../core/apollo/generated/graphql-schema';
import { contextSegmentSchema } from './Common/ContextSegment';
import { HubContextSegment } from '../hub/HubContextSegment';

interface HubEditFormProps {
  context?: Context;
  profile?: Profile;
  onSubmit: (formData: HubEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  isEdit: boolean;
  loading: boolean;
}

export interface HubEditFormValuesType {
  background: string;
  impact: string;
  vision: string;
  who: string;
}

const HubEditForm: FC<HubEditFormProps> = ({ context, profile, onSubmit, wireSubmit, loading }) => {
  const initialValues: HubEditFormValuesType = {
    background: profile?.description || '',
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
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return <HubContextSegment loading={loading} />;
      }}
    </Formik>
  );
};

export default HubEditForm;
