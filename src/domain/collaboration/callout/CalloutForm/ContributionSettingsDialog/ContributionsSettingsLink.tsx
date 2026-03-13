import { Formik, type FormikProps, useField } from 'formik';
import { useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { isArrayEqual } from '@/core/utils/isArrayEqual';
import { EmptyReference, type ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import ReferenceSegment from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import type { CalloutFormSubmittedValues } from '../CalloutFormModel';
import type { ContributionTypeSettingsComponentRef, ContributionTypeSettingsProps } from './ContributionSettingsDialog';

const filterOutEmptyLinks = (link: ReferenceModel): boolean => Boolean(link.name || link.uri || link.description);

const ContributionsSettingsLink = ({
  ref,
  calloutRestrictions,
}: ContributionTypeSettingsProps & {
  ref?: React.Ref<ContributionTypeSettingsComponentRef>;
}) => {
  const { t } = useTranslation();
  const [field, , meta] =
    useField<Required<CalloutFormSubmittedValues>['contributions']['links']>('contributions.links');

  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Apply the changes to the local form to the formik state of the CalloutForm
      // Filter out empty links
      meta.setValue(internalFormRef.current?.values.links.filter(filterOutEmptyLinks));
    },
    isContentChanged: () => {
      const currentLinks = internalFormRef.current?.values.links.filter(filterOutEmptyLinks) ?? [];
      return !isArrayEqual(field.value, currentLinks);
    },
  }));

  const initialValues =
    field.value && field.value.length > 0 // If there are existing links, use them, if not create an empty one
      ? { links: field.value }
      : { links: [EmptyReference] };

  const internalFormRef = useRef<FormikProps<{ links: ReferenceModel[] }>>(null);

  if (calloutRestrictions?.readOnlyContributions) {
    // This component is only used to edit contributions, not contribution settings. Let's just hide it if we cannot change contributions.
    return null;
  }

  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
      {({ values }) => (
        <ReferenceSegment
          fieldName="links"
          references={values.links}
          fullWidth={true}
          addButtonLabel={t('callout.create.contributionSettings.contributionTypes.link.settings.addButton')}
          addButtonPosition="end"
        />
      )}
    </Formik>
  );
};

export default ContributionsSettingsLink;
