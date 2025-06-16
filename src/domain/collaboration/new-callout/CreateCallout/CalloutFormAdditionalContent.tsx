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

interface CalloutFormAdditionalContentProps {}

const CalloutFormAdditionalContent = ({}: CalloutFormAdditionalContentProps) => {
  const { t } = useTranslation();
  const [additionalContent, setAdditionalContent] = useState<CalloutAdditionalContentType>(
    CalloutAdditionalContentType.None
  );

  const [framing, , helpers] = useField<CalloutFormSubmittedValues['framing']>('framing');
  const whiteboardPreviewRef = useRef<FormikWhiteboardPreviewRef>(null);

  const handleAdditionalContentChange = (newValue: CalloutAdditionalContentType) => {
    setAdditionalContent(newValue);

    // Add / remove whiteboard content from the formik state based on the selected AdditionalContent radio buttons
    if (newValue === CalloutAdditionalContentType.Whiteboard) {
      const { whiteboard, ...rest } = framing.value;
      helpers.setValue({
        ...rest,
        whiteboard: {
          content: EmptyWhiteboardString,
          profile: {
            displayName: t('common.whiteboard'),
          },
          previewImages: undefined,
        },
      });
    } else {
      const { whiteboard, ...rest } = framing.value;
      helpers.setValue({ ...rest, whiteboard: undefined });
    }
  };

  // Open the dialog when the whiteboard is set and the option is selected
  useEffect(() => {
    if (
      whiteboardPreviewRef.current &&
      additionalContent === CalloutAdditionalContentType.Whiteboard &&
      framing.value.whiteboard &&
      // Only open the dialog if the whiteboard content is empty, to avoid opening it when editing a template
      framing.value.whiteboard.content === EmptyWhiteboardString
    ) {
      whiteboardPreviewRef.current.openEditDialog();
    }
  }, [additionalContent, framing.value.whiteboard, whiteboardPreviewRef.current]);

  return (
    <>
      <PageContentBlock sx={{ marginTop: gutters(-1) }}>
        <PageContentBlockHeader
          title={t('callout.create.additionalContent.title')}
          actions={
            <RadioButtonsGroup
              options={[
                {
                  icon: BlockIcon,
                  value: CalloutAdditionalContentType.None,
                  label: t('callout.create.additionalContent.none.title'),
                  tooltip: t('callout.create.additionalContent.none.tooltip'),
                },
                {
                  icon: WhiteboardIcon,
                  value: CalloutAdditionalContentType.Whiteboard,
                  label: t('callout.create.additionalContent.whiteboard.title'),
                  tooltip: t('callout.create.additionalContent.whiteboard.tooltip'),
                },
              ]}
              value={additionalContent}
              onChange={handleAdditionalContentChange}
            />
          }
        />
      </PageContentBlock>
      {framing.value.whiteboard && additionalContent === CalloutAdditionalContentType.Whiteboard && (
        <PageContentBlock disablePadding>
          <FormikWhiteboardPreview
            ref={whiteboardPreviewRef}
            name="framing.whiteboard.content"
            previewImagesName="framing.whiteboard.previewImages"
            canEdit
            onChangeContent={() => whiteboardPreviewRef.current?.closeEditDialog()}
            onDeleteContent={() => handleAdditionalContentChange(CalloutAdditionalContentType.None)}
            maxHeight={gutters(12)}
            dialogProps={{ title: t('components.callout-creation.whiteboard.editDialogTitle') }}
          />
        </PageContentBlock>
      )}
    </>
  );
};

export default CalloutFormAdditionalContent;
