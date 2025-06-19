import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ContributionTypeSettingsComponentRef } from './ContributionSettingsDialog';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { Formik, FormikProps, useField } from 'formik';
import { CalloutFormSubmittedValues } from '../CalloutForm';
import { Box } from '@mui/material';
import { Caption, CardText } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';

const ContributionsSettingsPost = forwardRef<ContributionTypeSettingsComponentRef>((props, ref) => {
  const { t } = useTranslation();

  const [field, , meta] = useField<CalloutFormSubmittedValues['contributionDefaults']['postDescription']>(
    'contributionDefaults.postDescription'
  );

  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Apply the changes to the local form to the formik state of the CalloutForm
      meta.setValue(internalFormRef.current?.values.postDescription);
    },
    isContentChanged: () => field.value !== internalFormRef.current?.values.postDescription,
  }));

  const initialValues = {
    postDescription: field.value,
  };

  const internalFormRef = useRef<FormikProps<{ postDescription: string | undefined }>>(null);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
      <Gutters disablePadding>
        <Box>
          <Caption>
            {t('callout.create.contributionSettings.contributionTypes.post.settings.label')}
          </Caption>
          <CardText>
            {t('callout.create.contributionSettings.contributionTypes.post.settings.explanation')}
          </CardText>
        </Box>
        <FormikMarkdownField
          title={t('callout.create.contributionSettings.contributionTypes.post.settings.text')}
          name="postDescription"
        />
      </Gutters>
    </Formik>
  );
});

export default ContributionsSettingsPost;
