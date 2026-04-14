import BlockIcon from '@mui/icons-material/Block';
import BurstModeOutlinedIcon from '@mui/icons-material/BurstModeOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SlideshowOutlined from '@mui/icons-material/SlideshowOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import { Tooltip } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutFramingType,
  CollaboraDocumentType,
  PollResultsDetail,
  PollResultsVisibility,
  type PollStatus,
} from '@/core/apollo/generated/graphql-schema';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import EditButton from '@/core/ui/actions/EditButton';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import FormikRadioButtonsGroup from '@/core/ui/forms/radioButtons/FormikRadioButtonsGroup';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import { nameOf } from '@/core/utils/nameOf';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import type { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import { MemoIcon } from '../../memo/icon/MemoIcon';
import PollFormFields from '../../poll/PollFormFields';
import FormikWhiteboardPreview from '../../whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { DefaultWhiteboardPreviewSettings } from '../../whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { CalloutFormSubmittedValues } from './CalloutFormModel';

const CalloutFramingMediaGalleryField = lazyWithGlobalErrorHandler(
  () => import('../CalloutFramings/CalloutFramingMediaGalleryField')
);

interface CalloutFormFramingSettingsProps {
  calloutRestrictions?: CalloutRestrictions;
  edit?: boolean;
  /** Indicates if the form is used in a template context */
  template?: boolean;
  pollId?: string;
  pollStatus?: PollStatus;
}

const CalloutFormFramingSettings = ({
  calloutRestrictions,
  edit,
  template,
  pollId,
  pollStatus,
}: CalloutFormFramingSettingsProps) => {
  const { t } = useTranslation();

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
            previewSettings: DefaultWhiteboardPreviewSettings,
          },
          memo: undefined,
          link: undefined,
          poll: undefined,
        };
        break;
      case CalloutFramingType.Memo:
        newFraming = {
          ...framing,
          type: newType,
          whiteboard: undefined,
          link: undefined,
          mediaGallery: undefined,
          poll: undefined,
          memo: {
            profile: { displayName: t('common.memo') },
            markdown: undefined,
          },
        };
        break;
      case CalloutFramingType.MediaGallery:
        newFraming = {
          ...framing,
          type: newType,
          mediaGallery: {
            visuals: [],
          },
          whiteboard: undefined,
          memo: undefined,
          link: undefined,
          poll: undefined,
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
          mediaGallery: undefined,
          poll: undefined,
        };
        break;
      case CalloutFramingType.Poll:
        newFraming = {
          ...framing,
          type: newType,
          poll: {
            title: '',
            options: [{ text: '' }, { text: '' }],
            settings: {
              allowContributorsAddOptions: false,
              minResponses: 1,
              maxResponses: 1,
              resultsVisibility: PollResultsVisibility.Visible,
              resultsDetail: PollResultsDetail.Full,
            },
          },
          whiteboard: undefined,
          memo: undefined,
          link: undefined,
          mediaGallery: undefined,
        };
        break;
      case CalloutFramingType.CollaboraDocument:
        newFraming = {
          ...framing,
          type: newType,
          collaboraDocument: {
            displayName: t('collaboraDocument.create.documentType.TEXT_DOCUMENT'),
            documentType: CollaboraDocumentType.TextDocument,
          },
          whiteboard: undefined,
          memo: undefined,
          link: undefined,
          mediaGallery: undefined,
          poll: undefined,
        };
        break;
      default:
        newFraming = {
          ...framing,
          type: newType,
          whiteboard: undefined,
          memo: undefined,
          link: undefined,
          mediaGallery: undefined,
          poll: undefined,
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
        {
          icon: BurstModeOutlinedIcon,
          value: CalloutFramingType.MediaGallery,
          label: t('callout.create.framingSettings.mediaGallery.title'),
          tooltip: t('callout.create.framingSettings.mediaGallery.tooltip'),
          disabled: calloutRestrictions?.disableMediaGallery,
        },
        {
          icon: ChecklistRtlIcon,
          value: CalloutFramingType.Poll,
          label: t('callout.create.framingSettings.poll.title'),
          tooltip: t('callout.create.framingSettings.poll.tooltip'),
          disabled: calloutRestrictions?.disablePolls,
        },
        {
          icon: DescriptionOutlined,
          value: CalloutFramingType.CollaboraDocument,
          label: t('callout.create.framingSettings.collaboraDocument.title'),
          tooltip: t('callout.create.framingSettings.collaboraDocument.tooltip'),
        },
      ]}
      onChange={handleFramingTypeChange}
    />
  );

  const editButton = (() => {
    if (!calloutRestrictions?.onlyRealTimeWhiteboardFraming) {
      return undefined; // Use the FormikWhiteboardPreview's default edit button
    } else {
      // TODO: Maybe in the future, open the real-time whiteboard editor from here
      return (
        <Tooltip title={t('callout.create.framingSettings.whiteboard.onlyRealTimeEditorAvailable')}>
          <span>
            <EditButton disabled={true} />
          </span>
        </Tooltip>
      );
    }
  })();

  const showMemoContent = !edit || template; // Editable memo content if not in edit mode or if in template mode

  return (
    <>
      <PageContentBlock sx={{ marginTop: gutters(-1) }}>
        <PageContentBlockHeader
          title={t('callout.create.framingSettings.title')}
          actions={radioButtons}
          autoCollapseActions={true}
        />
      </PageContentBlock>

      {framing.whiteboard && framing.type === CalloutFramingType.Whiteboard && (
        <PageContentBlock disablePadding={true}>
          <FormikWhiteboardPreview
            name="framing.whiteboard.content"
            previewImagesName="framing.whiteboard.previewImages"
            previewSettingsName="framing.whiteboard.previewSettings"
            canEdit={true}
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
          hideImageOptions={true}
          maxLength={MARKDOWN_TEXT_LENGTH}
        />
      )}

      {framing.type === CalloutFramingType.Link && (
        <PageContentBlockSeamless row={true} disablePadding={true}>
          <FormikInputField
            containerProps={{ width: '70%' }}
            name="framing.link.profile.displayName"
            title={t('components.callout-creation.framing.link.name')}
            value={framing.link?.profile.displayName || ''}
            onChange={e => handleLinkChange('displayName', e.target.value)}
            required={true}
          />
          <FormikInputField
            containerProps={{ width: '30%' }}
            name="framing.link.uri"
            title={t('components.callout-creation.framing.link.url')}
            value={framing.link?.uri || ''}
            onChange={e => handleLinkChange('uri', e.target.value)}
            required={true}
          />
        </PageContentBlockSeamless>
      )}

      {framing.type === CalloutFramingType.MediaGallery && (
        <Suspense fallback={<Loading />}>
          <CalloutFramingMediaGalleryField />
        </Suspense>
      )}

      {framing.poll && framing.type === CalloutFramingType.Poll && (
        <PageContentBlock sx={{ marginBottom: gutters() }}>
          <PollFormFields readOnlySettings={edit} pollId={pollId} pollStatus={pollStatus} />
        </PageContentBlock>
      )}

      {framing.type === CalloutFramingType.CollaboraDocument && (
        <PageContentBlock>
          <PageContentBlockHeader title={t('collaboraDocument.create.documentType.label')} />
          <FormikRadioButtonsGroup
            name="framing.collaboraDocument.documentType"
            onChange={(newType: CollaboraDocumentType) => {
              const typeLabels: Record<CollaboraDocumentType, string> = {
                [CollaboraDocumentType.TextDocument]: t('collaboraDocument.create.documentType.TEXT_DOCUMENT'),
                [CollaboraDocumentType.Spreadsheet]: t('collaboraDocument.create.documentType.SPREADSHEET'),
                [CollaboraDocumentType.Presentation]: t('collaboraDocument.create.documentType.PRESENTATION'),
              };
              setFieldValue('framing.collaboraDocument.displayName', typeLabels[newType]);
            }}
            options={[
              {
                icon: ArticleOutlined,
                value: CollaboraDocumentType.TextDocument,
                label: t('collaboraDocument.create.documentType.TEXT_DOCUMENT'),
              },
              {
                icon: TableChartOutlined,
                value: CollaboraDocumentType.Spreadsheet,
                label: t('collaboraDocument.create.documentType.SPREADSHEET'),
              },
              {
                icon: SlideshowOutlined,
                value: CollaboraDocumentType.Presentation,
                label: t('collaboraDocument.create.documentType.PRESENTATION'),
              },
            ]}
          />
        </PageContentBlock>
      )}
    </>
  );
};

export default CalloutFormFramingSettings;
