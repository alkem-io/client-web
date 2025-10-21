import { Formik } from 'formik';
import React, { FC } from 'react';
import * as yup from 'yup';
import { SpaceAboutSegment, spaceAboutSegmentSchema } from '@/domain/space/about/SpaceAboutSegment';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

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
    description: spaceAboutSegmentSchema.fields?.description || textLengthValidator(),
    why: spaceAboutSegmentSchema.fields?.why || textLengthValidator(),
    who: spaceAboutSegmentSchema.fields?.who || textLengthValidator(),
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

        return <SpaceAboutSegment loading={loading} spaceLevel={spaceLevel ?? SpaceLevel.L0} />;
      }}
    </Formik>
  );
};

export default SpaceAboutForm;
