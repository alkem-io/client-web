import BlockIcon from '@mui/icons-material/Block';
import CampaignIcon from '@mui/icons-material/Campaign';
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
import { MemoIcon } from '../../memo/icon/MemoIcon';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

interface CalloutFormFramingSettingsProps {
  calloutRestrictions?: CalloutRestrictions;
  edit?: boolean;
  /** Indicates if the form is used in a template context */
  template?: boolean;
}

const CalloutFormFramingSettings = ({ calloutRestrictions, edit, template }: CalloutFormFramingSettingsProps) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();

  const [{ value: framing }] = useField<CalloutFormSubmittedValues['framing']>('framing');
  const { setFieldValue } = useFormikContext<CalloutFormSubmittedValues>();

  const handleFramingTypeChange = (newType: CalloutFramingType) => {
    let newFraming: CalloutFormSubmittedValues['framing'] | undefined;

    switch (newType) {
      case CalloutFramingType.Whiteboard:
        newFraming = {
          ...framing,
          type: newType,
          whiteboard: {
            content: EmptyWhiteboardString,
            profile: { displayName: t('common.whiteboard') },
            previewImages: [],
          },
          memo: undefined,
          link: undefined,
        };
        break;
      case CalloutFramingType.Memo:
        newFraming = {
          ...framing,
          type: newType,
          whiteboard: undefined,
          link: undefined,
          memo: {
            profile: { displayName: t('common.memo') },
            markdown: undefined,
          },
        };
        break;
      case CalloutFramingType.Link:
        newFraming = {
          ...framing,
          type: newType,
          link: {
            uri: '',
            profile: {
              displayName: '',
            },
          },
          whiteboard: undefined,
          memo: undefined,
        };
        break;
      case CalloutFramingType.None:
      default:
        newFraming = {
          ...framing,
          type: newType,
          whiteboard: undefined,
          memo: undefined,
          link: undefined,
        };
        break;
    }

    setFieldValue('framing', newFraming);
  };

  const handleLinkChange = (field: 'uri' | 'displayName', value: string) => {
    if (field === 'displayName') {
      setFieldValue('framing.link.profile.displayName', value);
    } else {
      setFieldValue('framing.link.uri', value);
    }
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
        {
          icon: MemoIcon,
          value: CalloutFramingType.Memo,
          label: t('callout.create.framingSettings.memo.title'),
          tooltip: t('callout.create.framingSettings.memo.tooltip'),
          disabled: calloutRestrictions?.disableMemos,
        },
        {
          icon: CampaignIcon,
          value: CalloutFramingType.Link,
          label: t('callout.create.framingSettings.link.title'),
          tooltip: t('callout.create.framingSettings.link.tooltip'),
          disabled: calloutRestrictions?.disableLinks,
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

  const showMemoContent = !edit || template; // Editable memo content if not in edit mode or if in template mode

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
            dialogProps={{ title: t('components.callout-creation.framing.whiteboard.editDialogTitle') }}
          />
        </PageContentBlock>
      )}

      {showMemoContent && framing.memo && framing.type === CalloutFramingType.Memo && (
        <FormikMarkdownField
          title={t('components.callout-creation.framing.memo.name')}
          placeholder={t('components.callout-creation.framing.memo.placeholder')}
          rows={10}
          name={nameOf<CalloutFormSubmittedValues>('framing.memo.markdown')}
          hideImageOptions
          maxLength={MARKDOWN_TEXT_LENGTH}
        />
      )}

      {framing.type === CalloutFramingType.Link && (
        <PageContentBlockSeamless row disablePadding>
          <>
            <FormikInputField
              containerProps={{ width: '70%' }}
              name="framing.link.profile.displayName"
              title={t('components.callout-creation.framing.link.name')}
              value={framing.link?.profile.displayName || ''}
              onChange={e => handleLinkChange('displayName', e.target.value)}
              required
            />
            <FormikInputField
              containerProps={{ width: '30%' }}
              name="framing.link.uri"
              title={t('components.callout-creation.framing.link.url')}
              value={framing.link?.uri || ''}
              onChange={e => handleLinkChange('uri', e.target.value)}
              required
            />
          </>
        </PageContentBlockSeamless>
      )}
    </>
  );
};

export default CalloutFormFramingSettings;
