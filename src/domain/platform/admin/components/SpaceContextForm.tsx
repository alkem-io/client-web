import { Formik } from 'formik';
import React, { FC, useCallback, useMemo } from 'react';
import * as yup from 'yup';
import { Context, Profile } from '../../../../core/apollo/generated/graphql-schema';
import { contextSegmentSchema } from './Common/ContextSegment';
import { SpaceContextSegment } from '../space/SpaceContextSegment';

interface SpaceEditFormProps {
  context?: Context;
  profile?: Profile;
  onSubmit: (formData: SpaceEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  isEdit: boolean;
  loading: boolean;
}

export interface SpaceEditFormValuesType {
  background: string;
  impact: string;
  vision: string;
  who: string;
}

const SpaceEditForm: FC<SpaceEditFormProps> = ({ context, profile, onSubmit, wireSubmit, loading }) => {
  const initialValues: SpaceEditFormValuesType = useMemo(() => {
    console.log('generating initial values');
    return {
      background: profile?.description || '',
      impact: context?.impact || '',
      vision: context?.vision || '',
      who: context?.who || '',
    };
  }, [profile?.id]);
  const onSubmitCallback = useCallback(async values => {
    onSubmit(values);
  }, []);

  const validationSchema = yup.object().shape({
    // background: contextSegmentSchema.fields?.background || yup.string(),
    // impact: contextSegmentSchema.fields?.impact || yup.string(),
    // vision: contextSegmentSchema.fields?.vision || yup.string(),
    // who: contextSegmentSchema.fields?.who || yup.string(),
  });

  let isSubmitWired = false;
  if (!profile?.id) {
    return <>Loading... //!!</>;
  }
  return (
    <Formik initialValues={initialValues} enableReinitialize onSubmit={onSubmitCallback}>
      {({ handleSubmit, errors }) => {
        console.log('formik errors', errors);
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <>
            hello
            <SpaceContextSegment loading={loading} />
          </>
        );
      }}
    </Formik>
  );
};

export default SpaceEditForm;
