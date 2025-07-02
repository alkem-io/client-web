import { useRef } from 'react';
import BlockIcon from '@mui/icons-material/Block';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import FormikRadioButtonsGroup from '@/core/ui/forms/radioButtons/FormikRadioButtonsGroup';
import { nameOf } from '@/core/utils/nameOf';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import FormikWhiteboardPreview from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useField, useFormikContext } from 'formik';
import { CalloutFormSubmittedValues } from './CalloutFormModel';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { FormikWhiteboardPreviewRef } from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useScreenSize } from '@/core/ui/grid/constants';
import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';

interface CalloutFormFramingSettingsProps {
  calloutRestrictions?: CalloutRestrictions;
}

const CalloutFormFramingSettings = ({ calloutRestrictions }: CalloutFormFramingSettingsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();

  const [{ value: framing }] = useField<CalloutFormSubmittedValues['framing']>('framing');
  const whiteboardPreviewRef = useRef<FormikWhiteboardPreviewRef>(null);
  const { setFieldValue } = useFormikContext<CalloutFormSubmittedValues>();

  const handleFramingTypeChange = (newType: CalloutFramingType) => {
    const newFraming =
      newType === CalloutFramingType.Whiteboard
        ? {
            ...framing,
            type: newType,
            whiteboard: {
              content: EmptyWhiteboardString,
              profile: { displayName: t('common.whiteboard') },
              previewImages: [],
            },
          }
        : { ...framing, type: newType, whiteboard: undefined };
    setFieldValue('framing', newFraming);
  };

  // Instantiating them here to be able to move them when the screen is small
  const radioButtons = (
    <FormikRadioButtonsGroup
      name={nameOf<CalloutFormSubmittedValues>('framing.type')}
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
          disabled: calloutRestrictions?.disableWhiteboards,
        },
      ]}
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

      {framing.whiteboard && framing.type === CalloutFramingType.Whiteboard && (
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
