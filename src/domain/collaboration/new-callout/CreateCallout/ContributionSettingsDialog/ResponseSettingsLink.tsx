import ReferenceSegment from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { Formik, FormikProps, useField } from 'formik';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CalloutFormSubmittedValues } from '../CalloutForm';
import { ContributionTypeSettingsComponentRef } from './ContributionSettingsDialog';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { isEqual } from 'lodash';

const ResponseSettingsLink = forwardRef<ContributionTypeSettingsComponentRef>((props, ref) => {
  const [field, , meta] =
    useField<CalloutFormSubmittedValues['contributionDefaults']['links']>('contributionDefaults.links');

  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Apply the changes to the local form to the formik state of the CalloutForm
      meta.setValue(internalFormRef.current?.values.links);
    },
    isContentChanged: () => isEqual(field.value, internalFormRef.current?.values.links),
  }));

  const initialValues = {
    links: field.value ?? [],
  };

  const internalFormRef = useRef<FormikProps<{ links: ReferenceModel[] }>>(null);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
      {({ values }) => <ReferenceSegment fieldName="links" references={values.links} fullWidth compactMode />}
    </Formik>
  );
});

export default ResponseSettingsLink;
