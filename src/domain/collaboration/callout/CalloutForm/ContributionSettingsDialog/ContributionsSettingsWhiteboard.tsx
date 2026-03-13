import { Box } from '@mui/material';
import { Formik, type FormikProps, useField } from 'formik';
import type React from 'react';
import { useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption, CardText } from '@/core/ui/typography';
import FormikWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { CalloutFormSubmittedValues } from '../CalloutFormModel';
import type { ContributionTypeSettingsComponentRef, ContributionTypeSettingsProps } from './ContributionSettingsDialog';

const ContributionsSettingsWhiteboard = ({
  ref,
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
        whiteboardContent: internalFormRef.current?.values.whiteboardContent,
      });
    },
    isContentChanged: () =>
      field.value.defaultDisplayName !== internalFormRef.current?.values.defaultDisplayName ||
      field.value.whiteboardContent !== internalFormRef.current?.values.whiteboardContent,
  }));

  const initialValues = {
    defaultDisplayName: field.value.defaultDisplayName ?? '',
    whiteboardContent: field.value.whiteboardContent ?? EmptyWhiteboardString,
  };

  const internalFormRef = useRef<FormikProps<{ defaultDisplayName: string; whiteboardContent: string }>>(null);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
      <Gutters disablePadding={true}>
        <Box>
          <Caption>{t('callout.create.contributionSettings.contributionTypes.whiteboard.settings.label')}</Caption>
          <CardText>
            {t('callout.create.contributionSettings.contributionTypes.whiteboard.settings.explanation')}
          </CardText>
        </Box>
        <FormikInputField
          title={t('callout.create.contributionSettings.contributionTypes.common.defaultDisplayName')}
          name="defaultDisplayName"
        />
        <PageContentBlock disablePadding={true}>
          <FormikWhiteboardPreview
            name="whiteboardContent"
            canEdit={true}
            onDeleteContent={() => internalFormRef.current?.setFieldValue('whiteboardContent', EmptyWhiteboardString)}
            maxHeight={gutters(12)}
            dialogProps={{ title: t('components.callout-creation.framing.whiteboard.editDialogTitle') }}
          />
        </PageContentBlock>
      </Gutters>
    </Formik>
  );
};

export default ContributionsSettingsWhiteboard;
