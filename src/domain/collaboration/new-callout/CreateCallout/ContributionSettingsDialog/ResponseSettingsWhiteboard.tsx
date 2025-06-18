import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ContributionTypeSettingsComponentRef } from './ContributionSettingsDialog';
import { Formik, FormikProps, useField } from 'formik';
import { CalloutFormSubmittedValues } from '../CalloutForm';
import FormikWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { gutters } from '@/core/ui/grid/utils';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';

const ResponseSettingsWhiteboard = forwardRef<ContributionTypeSettingsComponentRef>((props, ref) => {
  const { t } = useTranslation();

  const [field, , meta] = useField<CalloutFormSubmittedValues['contributionDefaults']['whiteboardContent']>(
    'contributionDefaults.whiteboardContent'
  );

  useImperativeHandle(ref, () => ({
    onSave: () => {
      // Apply the changes to the local form to the formik state of the CalloutForm
      meta.setValue(internalFormRef.current?.values.whiteboardContent);
    },
    isContentChanged: () => field.value !== internalFormRef.current?.values.whiteboardContent,
  }));

  const initialValues = {
    whiteboardContent: field.value,
  };

  const internalFormRef = useRef<FormikProps<{ whiteboardContent: string | undefined }>>(null);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}} innerRef={internalFormRef}>
      <PageContentBlock disablePadding>
        <FormikWhiteboardPreview
          name="whiteboardContent"
          canEdit
          onDeleteContent={() => internalFormRef.current?.setFieldValue('whiteboardContent', EmptyWhiteboardString)}
          maxHeight={gutters(12)}
          dialogProps={{ title: t('components.callout-creation.whiteboard.editDialogTitle') }}
        />
      </PageContentBlock>
    </Formik>
  );
});

export default ResponseSettingsWhiteboard;
