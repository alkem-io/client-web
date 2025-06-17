import { useRef, useState, useEffect } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import RadioButtonsGroup from '@/core/ui/forms/radioButtons/RadioButtonsGroup';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { CalloutFramingType } from './constants';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import FormikWhiteboardPreview from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useField } from 'formik';
import { CalloutFormSubmittedValues } from './CalloutForm';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { FormikWhiteboardPreviewRef } from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useScreenSize } from '@/core/ui/grid/constants';

interface CalloutFormAdditionalContentProps {}

const CalloutFormAdditionalContent = ({}: CalloutFormAdditionalContentProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [additionalContent, setAdditionalContent] = useState<CalloutFramingType>(CalloutFramingType.None);

  const [framing, , helpers] = useField<CalloutFormSubmittedValues['framing']>('framing');
  const whiteboardPreviewRef = useRef<FormikWhiteboardPreviewRef>(null);

  const handleAdditionalContentChange = (newValue: CalloutFramingType) => {
    setAdditionalContent(newValue);

    // Add / remove whiteboard content from the formik state based on the selected AdditionalContent radio buttons
    if (newValue === CalloutFramingType.Whiteboard) {
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
      additionalContent === CalloutFramingType.Whiteboard &&
      framing.value.whiteboard &&
      // Only open the dialog if the whiteboard content is empty, to avoid opening it when editing a template
      framing.value.whiteboard.content === EmptyWhiteboardString
    ) {
      whiteboardPreviewRef.current.openEditDialog();
    }
  }, [additionalContent, framing.value.whiteboard, whiteboardPreviewRef.current]);

  // Instantiating them here to be able to move them when the screen is small
  const radioButtons = (
    <RadioButtonsGroup
      options={[
        {
          icon: BlockIcon,
          value: CalloutFramingType.None,
          label: t('callout.create.additionalContent.none.title'),
          tooltip: t('callout.create.additionalContent.none.tooltip'),
        },
        {
          icon: WhiteboardIcon,
          value: CalloutFramingType.Whiteboard,
          label: t('callout.create.additionalContent.whiteboard.title'),
          tooltip: t('callout.create.additionalContent.whiteboard.tooltip'),
        },
      ]}
      value={additionalContent}
      onChange={handleAdditionalContentChange}
    />
  );

  return (
    <>
      <PageContentBlock sx={{ marginTop: gutters(-1) }}>
        <PageContentBlockHeader
          title={t('callout.create.additionalContent.title')}
          actions={!isMediumSmallScreen && radioButtons}
        />
        {isMediumSmallScreen && radioButtons}
      </PageContentBlock>

      {framing.value.whiteboard && additionalContent === CalloutFramingType.Whiteboard && (
        <PageContentBlock disablePadding>
          <FormikWhiteboardPreview
            ref={whiteboardPreviewRef}
            name="framing.whiteboard.content"
            previewImagesName="framing.whiteboard.previewImages"
            canEdit
            onChangeContent={() => whiteboardPreviewRef.current?.closeEditDialog()}
            onDeleteContent={() => handleAdditionalContentChange(CalloutFramingType.None)}
            maxHeight={gutters(12)}
            dialogProps={{ title: t('components.callout-creation.whiteboard.editDialogTitle') }}
          />
        </PageContentBlock>
      )}
    </>
  );
};

export default CalloutFormAdditionalContent;
