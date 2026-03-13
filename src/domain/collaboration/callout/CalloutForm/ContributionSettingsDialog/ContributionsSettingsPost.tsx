import { Box } from '@mui/material';
import { Formik, type FormikProps, useField } from 'formik';
import type React from 'react';
import { useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, CardText } from '@/core/ui/typography';
import type { CalloutFormSubmittedValues } from '../CalloutFormModel';
import type { ContributionTypeSettingsComponentRef, ContributionTypeSettingsProps } from './ContributionSettingsDialog';

const ContributionsSettingsPost = ({
  ref,
  calloutRestrictions,
}: ContributionTypeSettingsProps & {
  ref?: React.Ref<ContributionTypeSettingsComponentRef>;
}) => {
  const { t } = useTranslation();

  const [field, , meta] = useField<CalloutFormSubmittedValues['contributionDefaults']>('contributionDefaults');

  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Apply the changes to the local form to the formik state of the CalloutForm
      meta.setValue({
        defaultDisplayName: internalFormRef.current?.values.defaultDisplayName,
        postDescription: internalFormRef.current?.values.postDescription,
      });
    },
    isContentChanged: () =>
      field.value.defaultDisplayName !== internalFormRef.current?.values.defaultDisplayName ||
      field.value.postDescription !== internalFormRef.current?.values.postDescription,
  }));

  const initialValues = {
    defaultDisplayName: field.value.defaultDisplayName ?? '',
    postDescription: field.value.postDescription ?? '',
  };

  const internalFormRef = useRef<FormikProps<{ defaultDisplayName: string; postDescription: string }>>(null);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
      <Gutters disablePadding={true}>
        <Box>
          <Caption>{t('callout.create.contributionSettings.contributionTypes.post.settings.label')}</Caption>
          <CardText>{t('callout.create.contributionSettings.contributionTypes.post.settings.explanation')}</CardText>
        </Box>
        <FormikInputField
          title={t('callout.create.contributionSettings.contributionTypes.common.defaultDisplayName')}
          name="defaultDisplayName"
        />
        <FormikMarkdownField
          title={t('callout.create.contributionSettings.contributionTypes.post.settings.text')}
          name="postDescription"
          hideImageOptions={calloutRestrictions?.disableRichMedia}
        />
      </Gutters>
    </Formik>
  );
};

export default ContributionsSettingsPost;
