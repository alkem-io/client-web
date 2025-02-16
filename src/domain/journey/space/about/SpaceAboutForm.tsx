import { Formik } from 'formik';
import React, { FC } from 'react';
import * as yup from 'yup';
import { spaceAboutSegmentSchema } from '../../../platform/admin/components/Common/ContextSegment';
import { SpaceContextSegment } from '../../../platform/admin/space/SpaceContextSegment';

interface SpaceAboutEditFormProps {
  about: {
    when?: string;
    why?: string;
    who?: string;
    profile?: { description?: string };
  };
  onSubmit: (formData: SpaceAboutEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  isEdit: boolean;
  loading: boolean;
}

export interface SpaceAboutEditFormValuesType {
  description: string;
  when?: string;
  why?: string;
  who?: string;
}

const SpaceAboutEditForm: FC<SpaceAboutEditFormProps> = ({ about, onSubmit, wireSubmit, loading }) => {
  const initialValues: SpaceAboutEditFormValuesType = {
    description: about.profile?.description ?? '',
    when: about?.when ?? '',
    why: about?.why ?? '',
    who: about?.who ?? '',
  };

  const validationSchema = yup.object().shape({
    description: spaceAboutSegmentSchema.fields?.description || yup.string(),
    when: spaceAboutSegmentSchema.fields?.when || yup.string(),
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

        return <SpaceContextSegment loading={loading} />;
      }}
    </Formik>
  );
};

export default SpaceAboutEditForm;
