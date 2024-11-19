import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Caption } from '@/core/ui/typography/components';
import { Box } from '@mui/material';
import FormikWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { gutters } from '@/core/ui/grid/utils';
import { CreateProfileInput } from '@/core/apollo/generated/graphql-schema';
import { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface WhiteboardFieldSubmittedValues {
  content: string;
  profileData: CreateProfileInput;
}

export interface WhiteboardFieldSubmittedValuesWithPreviewImages extends WhiteboardFieldSubmittedValues {
  // Whiteboard Preview Images are sent as visuals in a different call to the server after the callout is saved (See useCalloutCreationWithPreviewImages.ts)
  previewImages: WhiteboardPreviewImage[] | undefined;
}

export const CalloutWhiteboardField = ({ name }: { name: string }) => {
  const { t } = useTranslation();
  const [, , helpers] = useField<WhiteboardFieldSubmittedValuesWithPreviewImages>(name);

  const handleChangeContent = (newContent: string, previewImages?: WhiteboardPreviewImage[]) => {
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
        name={`${name}.content`}
        previewImagesName={`${name}.previewImages`}
        canEdit
        onChangeContent={handleChangeContent}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('components.callout-creation.whiteboard.editDialogTitle') }}
      />
    </>
  );
};

export default CalloutWhiteboardField;
