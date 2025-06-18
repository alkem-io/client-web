import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ContributionTypeSettingsComponentRef } from './CalloutFormResponseSettingsDialog';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { Formik, FormikProps, useField } from 'formik';
import { CalloutFormSubmittedValues } from '../CalloutForm';

const ResponseSettingsPost = forwardRef<ContributionTypeSettingsComponentRef>((props, ref) => {
  const [field, , meta] = useField<CalloutFormSubmittedValues['contributionDefaults']['postDescription']>(
    'contributionDefaults.postDescription'
  );

  useImperativeHandle(ref, () => ({
    onSave: () => {
      meta.setValue(internalFormRef.current?.values.postDescription);
    },
    onReset: () => {
      internalFormRef.current?.setFieldValue('postDescription', field.value);
    },
    clear: () => {
      meta.setValue(undefined);
    },
  }));

  const initialValues = {
    postDescription: field.value,
  };

  const internalFormRef = useRef<FormikProps<{ postDescription: string | undefined }>>(null);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
      <FormikMarkdownField title="Default Description" name="postDescription" onChange={() => {}} />
    </Formik>
  );
});

export default ResponseSettingsPost;
