import { Formik } from 'formik';
import React, { FC } from 'react';
import * as yup from 'yup';
import { ContextSegment, spaceAboutSegmentSchema } from '@/domain/platform/admin/components/Common/ContextSegment';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

interface SpaceAboutFormProps {
  about: {
    why?: string;
    who?: string;
    profile?: { description?: string };
  };
  onSubmit: (formData: SpaceAboutEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  isEdit: boolean;
  loading: boolean;
  spaceLevel?: SpaceLevel;
}

export interface SpaceAboutEditFormValuesType {
  description: string;
  why?: string;
  who?: string;
}

const SpaceAboutForm: FC<SpaceAboutFormProps> = ({ about, onSubmit, wireSubmit, loading, spaceLevel }) => {
  const initialValues: SpaceAboutEditFormValuesType = {
    description: about?.profile?.description ?? '',
    why: about?.why ?? '',
    who: about?.who ?? '',
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
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return <ContextSegment loading={loading} spaceLevel={spaceLevel ?? SpaceLevel.L0} />;
      }}
    </Formik>
  );
};

export default SpaceAboutForm;
