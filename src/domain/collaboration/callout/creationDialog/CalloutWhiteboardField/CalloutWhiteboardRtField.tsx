import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Caption } from '../../../../../core/ui/typography/components';
import { Box } from '@mui/material';
import FormikWhiteboardPreview from '../../../../platform/admin/templates/WhiteboardTemplates/FormikWhiteboardPreview';
import { gutters } from '../../../../../core/ui/grid/utils';
import { CreateProfileInput } from '../../../../../core/apollo/generated/graphql-schema';
import { WhiteboardPreviewImage } from '../../../whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

interface CalloutWhiteboardRtFieldProps {
  name: string;
}

export interface WhiteboardRtFieldSubmittedValues {
  content: string;
  profileData: CreateProfileInput;
}

export interface WhiteboardRtFieldSubmittedValuesWithPreviewImages extends WhiteboardRtFieldSubmittedValues {
  // Whiteboard Preview Images are sent as visuals in a different call to the server after the callout is saved (See useCalloutCreationWithPreviewImages.ts)
  previewImages: WhiteboardPreviewImage[] | undefined;
}

export const CalloutWhiteboardRtField: FC<CalloutWhiteboardRtFieldProps> = ({ name }) => {
  const { t } = useTranslation();
  const [, , helpers] = useField<WhiteboardRtFieldSubmittedValuesWithPreviewImages>(name);

  const handleChange = (newContent: string, previewImages?: WhiteboardPreviewImage[]) => {
    helpers.setValue({
      profileData: {
        displayName: t('common.whiteboard'),
      },
      content: newContent,
      previewImages,
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
        previewImagesName={`${name}.previewImages`}
        canEdit
        onChangeContent={handleChange}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('components.callout-creation.whiteboard.editDialogTitle') }}
      />
    </>
  );
};

export default CalloutWhiteboardRtField;
