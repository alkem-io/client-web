import ReferenceSegment from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { Formik, FormikProps, useField } from 'formik';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CalloutFormSubmittedValues } from '../CalloutForm';
import { ContributionTypeSettingsComponentRef, ContributionTypeSettingsProps } from './ContributionSettingsDialog';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { isArrayEqual } from '@/core/utils/isArrayEqual';
import { useTranslation } from 'react-i18next';

const ContributionsSettingsLink = forwardRef<ContributionTypeSettingsComponentRef, ContributionTypeSettingsProps>(
  ({}, ref) => {
    const { t } = useTranslation();
    const [field, , meta] =
      useField<CalloutFormSubmittedValues['contributionDefaults']['links']>('contributionDefaults.links');

    useImperativeHandle(ref, () => ({
      onSave: () => {
        // Apply the changes to the local form to the formik state of the CalloutForm
        meta.setValue(internalFormRef.current?.values.links);
      },
      isContentChanged: () => isArrayEqual(field.value, internalFormRef.current?.values.links),
    }));

    const initialValues = {
      links: field.value ?? [
        {
          id: '',
          name: '',
          uri: '',
          description: '',
        },
      ],
    };

    const internalFormRef = useRef<FormikProps<{ links: ReferenceModel[] }>>(null);
    return (
      <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
        {({ values }) => (
          <ReferenceSegment
            fieldName="links"
            references={values.links}
            fullWidth
            addButtonLabel={t('callout.create.contributionSettings.contributionTypes.link.settings.addButton')}
            addButtonPosition="end"
          />
        )}
      </Formik>
    );
  }
);

export default ContributionsSettingsLink;
