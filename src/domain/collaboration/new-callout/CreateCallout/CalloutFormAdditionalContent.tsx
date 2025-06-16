import { useRef, useState, useEffect } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import RadioButtonsGroup from '@/core/ui/forms/radioButtons/RadioButtonsGroup';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { CalloutAdditionalContentType } from './constants';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import FormikWhiteboardPreview from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useField } from 'formik';
import { CalloutFormSubmittedValues } from './CalloutForm';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { FormikWhiteboardPreviewRef } from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';

interface CalloutFormAdditionalContentProps {

}

const CalloutFormAdditionalContent = ({ }: CalloutFormAdditionalContentProps) => {
  const { t } = useTranslation();
  const [additionalContent, setAdditionalContent] = useState<CalloutAdditionalContentType>(CalloutAdditionalContentType.None);

  const [framing, , helpers] = useField<CalloutFormSubmittedValues['framing']>('framing');
  const whiteboardPreviewRef = useRef<FormikWhiteboardPreviewRef>(null);

  const handleAdditionalContentChange = (newValue: CalloutAdditionalContentType) => {
    setAdditionalContent(newValue);

    // Add / remove whiteboard content from the formik state based on the selected AdditionalContent radio buttons
    if (newValue === CalloutAdditionalContentType.Whiteboard) {
      const { whiteboard, ...rest } = framing.value;
      helpers.setValue({
        ...rest, whiteboard: {
          content: EmptyWhiteboardString,
          profile: {
            displayName: t('common.whiteboard'),
          },
          previewImages: undefined,
        }
      });
    } else {
      const { whiteboard, ...rest } = framing.value;
      helpers.setValue({ ...rest, whiteboard: undefined })
    }
  }

  // Open the dialog when the whiteboard is set and the option is selected
  useEffect(() => {
    if (
      additionalContent === CalloutAdditionalContentType.Whiteboard &&
      framing.value.whiteboard &&
      framing.value.whiteboard.content === EmptyWhiteboardString &&
      whiteboardPreviewRef.current
    ) {
      whiteboardPreviewRef.current.openEditDialog();
    }
  }, [additionalContent, framing.value.whiteboard, whiteboardPreviewRef.current]);

  return (
    <>
      <PageContentBlock sx={{marginTop: gutters(-1)}}>
        <PageContentBlockHeader
          title="Additional Content"
          actions={
            <RadioButtonsGroup options={[
              {
                icon: BlockIcon,
                value: CalloutAdditionalContentType.None,
                label: 'None',
                tooltip: 'No additional content',
              },
              {
                icon: WhiteboardIcon,
                value: CalloutAdditionalContentType.Whiteboard,
                label: 'Whiteboard',
                tooltip: 'Add a whiteboard to the callout',
              },
            ]} value={additionalContent}
              onChange={handleAdditionalContentChange}
            />
          }
        />
      </PageContentBlock>
      {framing.value.whiteboard && additionalContent === CalloutAdditionalContentType.Whiteboard && (
        <FormikWhiteboardPreview
          ref={whiteboardPreviewRef}
          name="framing.whiteboard.content"
          previewImagesName="framing.whiteboard.previewImages"
          canEdit
          onChangeContent={() => whiteboardPreviewRef.current?.closeEditDialog()}
          maxHeight={gutters(12)}
          dialogProps={{ title: t('components.callout-creation.whiteboard.editDialogTitle') }}
        />
      )}
    </>
  );
};

export default CalloutFormAdditionalContent;
