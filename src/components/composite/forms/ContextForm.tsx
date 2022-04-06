import { Formik } from 'formik';
import React, { FC } from 'react';
import * as yup from 'yup';
import { Context } from '../../../models/graphql-schema';
import { ContextSegment, contextSegmentSchema } from '../../Admin/Common/ContextSegment';

export interface ContextFormValues {
  // name: string;
  // nameID: string;
  background: string;
  impact: string;
  // tagline: string;
  vision: string;
  who: string;
  // references: Reference[];
  // visuals: Visual2[]; todo: enable when it's time
  // tagsets: Tagset[];
}

interface Props {
  context?: Context;
  // name?: string;
  // nameID?: string;
  // tagset?: Tagset;
  onSubmit: (formData: ContextFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  // contextOnly?: boolean;
  // isEdit: boolean;
}

const ContextForm: FC<Props> = ({ context, onSubmit, wireSubmit }) => {
  const initialValues: ContextFormValues = {
    // name: name || '',
    // nameID: nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    // tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    // references: context?.references || [],
    // tagsets: tagsets,
  };

  const validationSchema = yup.object().shape({
    // name: contextOnly ? yup.string() : nameSegmentSchema.fields?.name || yup.string(),
    // nameID: contextOnly ? yup.string() : nameSegmentSchema.fields?.nameID || yup.string(),
    background: contextSegmentSchema.fields?.background || yup.string(),
    impact: contextSegmentSchema.fields?.impact || yup.string(),
    // tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    vision: contextSegmentSchema.fields?.vision || yup.string(),
    who: contextSegmentSchema.fields?.who || yup.string(),
    // references: referenceSegmentSchema,
    // visual: visualSegmentSchema,
    // tagsets: tagsetSegmentSchema,
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

        return <ContextSegment />;
      }}
    </Formik>
  );
};

export default ContextForm;
