import { useRef, useState } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import RadioButtonsGroup from '@/core/ui/forms/radioButtons/RadioButtonsGroup';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import FormikWhiteboardPreview from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useField } from 'formik';
import { CalloutFormSubmittedValues } from './CalloutForm';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { FormikWhiteboardPreviewRef } from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useScreenSize } from '@/core/ui/grid/constants';

interface CalloutFormFramingSettingsProps {}

const CalloutFormFramingSettings = ({}: CalloutFormFramingSettingsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [framingTypeSelected, setFramingTypeSelected] = useState<CalloutFramingType>(CalloutFramingType.None);

  const [framing, , helpers] = useField<CalloutFormSubmittedValues['framing']>('framing');
  const whiteboardPreviewRef = useRef<FormikWhiteboardPreviewRef>(null);

  const handleFramingTypeChange = (newValue: CalloutFramingType) => {
    setFramingTypeSelected(newValue);

    // Add / remove whiteboard content from the formik state based on the selected framing type radio buttons
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

  // Instantiating them here to be able to move them when the screen is small
  const radioButtons = (
    <RadioButtonsGroup
      options={[
        {
          icon: BlockIcon,
          value: CalloutFramingType.None,
          label: t('callout.create.framingSettings.none.title'),
          tooltip: t('callout.create.framingSettings.none.tooltip'),
        },
        {
          icon: WhiteboardIcon,
          value: CalloutFramingType.Whiteboard,
          label: t('callout.create.framingSettings.whiteboard.title'),
          tooltip: t('callout.create.framingSettings.whiteboard.tooltip'),
        },
      ]}
      value={framingTypeSelected}
      onChange={handleFramingTypeChange}
    />
  );

  return (
    <>
      <PageContentBlock sx={{ marginTop: gutters(-1) }}>
        <PageContentBlockHeader
          title={t('callout.create.framingSettings.title')}
          actions={!isMediumSmallScreen && radioButtons}
        />
        {isMediumSmallScreen && radioButtons}
      </PageContentBlock>

      {framing.value.whiteboard && framingTypeSelected === CalloutFramingType.Whiteboard && (
        <PageContentBlock disablePadding>
          <FormikWhiteboardPreview
            ref={whiteboardPreviewRef}
            name="framing.whiteboard.content"
            previewImagesName="framing.whiteboard.previewImages"
            canEdit
            onChangeContent={() => whiteboardPreviewRef.current?.closeEditDialog()}
            onDeleteContent={() => handleFramingTypeChange(CalloutFramingType.None)}
            maxHeight={gutters(12)}
            dialogProps={{ title: t('components.callout-creation.whiteboard.editDialogTitle') }}
          />
        </PageContentBlock>
      )}
    </>
  );
};

export default CalloutFormFramingSettings;
