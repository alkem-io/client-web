import { Formik } from 'formik';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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
  loading: boolean;
  spaceLevel?: SpaceLevel;
}

export interface SpaceAboutEditFormValuesType {
  description: string;
  why?: string;
  who?: string;
}

export interface SpaceAboutFormHandle {
  submit: () => void;
}

const SpaceAboutForm = forwardRef<SpaceAboutFormHandle, SpaceAboutFormProps>(
  ({ about, onSubmit, loading, spaceLevel }, ref) => {
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

    const submitRef = useRef<(() => void) | null>(null);

    // Expose submit method to parent component
    useImperativeHandle(ref, () => ({
      submit: () => {
        submitRef.current?.();
      },
    }));

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
          // Store handleSubmit in ref
          submitRef.current = handleSubmit;

          return <SpaceAboutSegment loading={loading} spaceLevel={spaceLevel ?? SpaceLevel.L0} />;
        }}
      </Formik>
    );
  }
);

SpaceAboutForm.displayName = 'SpaceAboutForm';

export default SpaceAboutForm;
