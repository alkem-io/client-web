import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Caption } from '../../../../../core/ui/typography/components';
import { Box } from '@mui/material';
import FormikWhiteboardPreview from '../../../../platform/admin/templates/WhiteboardTemplates/FormikWhiteboardPreview';
import { gutters } from '../../../../../core/ui/grid/utils';
import { CreateProfileInput } from '../../../../../core/apollo/generated/graphql-schema';
import { BannerDimensions } from '../../../canvas/utils/getCanvasBannerCardDimensions';

interface CalloutWhiteboardFieldProps {
  name: string;
}

export interface WhiteboardFieldSubmittedValues {
  value: string;
  profileData: CreateProfileInput;
}

export interface WhiteboardFieldSubmittedValuesWithPreviewImage extends WhiteboardFieldSubmittedValues {
  // Whiteboard Preview Image is sent in a different call to the server after the callout is saved. See useCalloutCreation.ts
  previewImage: Blob | undefined;
}

export const CalloutWhiteboardField: FC<CalloutWhiteboardFieldProps> = ({ name }) => {
  const { t } = useTranslation();
  const [, , helpers] = useField<WhiteboardFieldSubmittedValuesWithPreviewImage>(name);

  const handleChange = (newValue: string, previewImage?: Blob) => {
    helpers.setValue({
      profileData: {
        displayName: t('components.callout-creation.custom-template'),
      },
      value: newValue,
      previewImage,
    });
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box>
          <Caption>{t('components.callout-creation.whiteboard.title')}</Caption>
        </Box>
      </Box>
      <FormikWhiteboardPreview
        name={`${name}.value`}
        canEdit
        onChangeValue={handleChange}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('components.callout-creation.whiteboard-field-dialog.title') }}
        previewDimensions={BannerDimensions}
      />
    </>
  );
};

export default CalloutWhiteboardField;
