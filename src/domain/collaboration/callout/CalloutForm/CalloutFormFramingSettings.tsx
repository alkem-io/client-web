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
import { useScreenSize } from '@/core/ui/grid/constants';
import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import { Tooltip } from '@mui/material';
import EditButton from '@/core/ui/actions/EditButton';
import { useMemo } from 'react';

interface CalloutFormFramingSettingsProps {
  calloutRestrictions?: CalloutRestrictions;
}

const CalloutFormFramingSettings = ({ calloutRestrictions }: CalloutFormFramingSettingsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();

  const [{ value: framing }] = useField<CalloutFormSubmittedValues['framing']>('framing');
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

  const editButton = useMemo(() => {
    if (!calloutRestrictions?.onlyRealTimeWhiteboardFraming) {
      return undefined; // Use the FormikWhiteboardPreview's default edit button
    } else {
      // TODO: Maybe in the future, open the real-time whiteboard editor from here
      return (
        <Tooltip title={t('callout.create.framingSettings.whiteboard.onlyRealTimeEditorAvailable')}>
          <span>
            <EditButton disabled />
          </span>
        </Tooltip>
      );
    }
  }, [calloutRestrictions?.onlyRealTimeWhiteboardFraming]);

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
            name="framing.whiteboard.content"
            previewImagesName="framing.whiteboard.previewImages"
            canEdit
            editButton={editButton}
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
