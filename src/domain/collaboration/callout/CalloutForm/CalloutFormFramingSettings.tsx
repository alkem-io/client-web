import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import BlockIcon from '@mui/icons-material/Block';
import BurstModeOutlinedIcon from '@mui/icons-material/BurstModeOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SlideshowOutlined from '@mui/icons-material/SlideshowOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutFramingType,
  CollaboraDocumentType,
  LicenseEntitlementType,
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
import {
  COLLABORA_IMPORT_ACCEPT_ATTR,
  COLLABORA_IMPORT_EXTENSIONS_P1,
  COLLABORA_IMPORT_MAX_BYTES,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraImportFormats';
import { filenameWithoutExtension } from '@/domain/collaboration/calloutContributions/collaboraDocument/filenameWithoutExtension';
import {
  type ValidationError,
  validateCollaboraImportFile,
} from '@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { useSpace } from '@/domain/space/context/useSpace';
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
  const [collaboraImportError, setCollaboraImportError] = useState<ValidationError | null>(null);

  const collaboraCapMb = Math.round(COLLABORA_IMPORT_MAX_BYTES / (1024 * 1024));
  const collaboraImportErrorMessage: string | null = collaboraImportError
    ? (() => {
        const formats = COLLABORA_IMPORT_EXTENSIONS_P1.join(', ');
        switch (collaboraImportError.kind) {
          case 'extension':
            return t('callout.create.framingSettings.collaboraDocument.upload.errors.unsupported', { formats });
          case 'size':
            return t('callout.create.framingSettings.collaboraDocument.upload.errors.tooLarge', {
              cap: collaboraCapMb,
            });
          case 'multiple-files':
            return t('callout.create.framingSettings.collaboraDocument.upload.errors.multiple');
          case 'folder':
            return t('callout.create.framingSettings.collaboraDocument.upload.errors.folder');
          default:
            return null;
        }
      })()
    : null;

  const handleCollaboraFileSelect = (file: File | null) => {
    if (!file) {
      setFieldValue('framing.collaboraDocument.uploadFile', undefined);
      setFieldValue('framing.collaboraDocument.autoPrefilledTitle', undefined);
      setCollaboraImportError(null);
      return;
    }
    const validation = validateCollaboraImportFile([file]);
    if (!validation.ok) {
      setCollaboraImportError(validation.error);
      // Don't stage the file when validation fails — pre-check before any network call.
      setFieldValue('framing.collaboraDocument.uploadFile', undefined);
      setFieldValue('framing.collaboraDocument.autoPrefilledTitle', undefined);
      return;
    }
    setCollaboraImportError(null);
    setFieldValue('framing.collaboraDocument.uploadFile', file);
    if (!framing.profile.displayName?.trim()) {
      const prefilled = filenameWithoutExtension(file.name);
      setFieldValue('framing.profile.displayName', prefilled);
      setFieldValue('framing.collaboraDocument.autoPrefilledTitle', prefilled);
    } else {
      setFieldValue('framing.collaboraDocument.autoPrefilledTitle', undefined);
    }
  };

  // Collabora "Document" framing is gated by SPACE_FLAG_OFFICE_DOCUMENTS on the
  // parent space's license. While the SpaceContext is loading (or this form
  // renders outside a SpaceContextProvider — e.g. template gallery — where
  // `loading` stays true), keep the option enabled so we don't false-disable it.
  const { entitlements, loading: spaceContextLoading } = useSpace();
  const officeDocumentsEnabled =
    spaceContextLoading || template || entitlements.includes(LicenseEntitlementType.SpaceFlagOfficeDocuments);

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
          collaboraDocument: undefined,
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
          collaboraDocument: undefined,
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
          collaboraDocument: undefined,
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
          collaboraDocument: undefined,
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
          collaboraDocument: undefined,
        };
        break;
      case CalloutFramingType.CollaboraDocument:
        newFraming = {
          ...framing,
          type: newType,
          collaboraDocument: {
            displayName: framing.profile.displayName || t('common.collaboraDocument'),
            documentType: CollaboraDocumentType.Wordprocessing,
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
          collaboraDocument: undefined,
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
          tooltip: officeDocumentsEnabled
            ? t('callout.create.framingSettings.collaboraDocument.tooltip')
            : t('callout.create.framingSettings.collaboraDocument.notEnabledTooltip'),
          disabled: !officeDocumentsEnabled,
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
          {/* Document type is fixed at creation time — Collabora has no server-side
              conversion path between text/spreadsheet/presentation, so editing an
              existing callout shows the picker read-only. */}
          <FormikRadioButtonsGroup
            name="framing.collaboraDocument.documentType"
            readOnly={edit || !!framing.collaboraDocument?.uploadFile}
            options={[
              {
                icon: ArticleOutlined,
                value: CollaboraDocumentType.Wordprocessing,
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
          {!edit && (
            <Stack spacing={1} marginTop={2}>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                {t('callout.create.framingSettings.collaboraDocument.upload.or')}
              </Typography>
              {framing.collaboraDocument?.uploadFile ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1, padding: 1.5 }}
                >
                  <UploadFileOutlined fontSize="small" color="primary" />
                  <Box flex={1} overflow="hidden">
                    <Typography variant="body2" noWrap={true} title={framing.collaboraDocument.uploadFile.name}>
                      {framing.collaboraDocument.uploadFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(framing.collaboraDocument.uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleCollaboraFileSelect(null)}
                    aria-label={t('callout.create.framingSettings.collaboraDocument.upload.removeFile')}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileOutlined />}
                  sx={{ alignSelf: 'center' }}
                >
                  {t('callout.create.framingSettings.collaboraDocument.upload.hint')}
                  <input
                    type="file"
                    accept={COLLABORA_IMPORT_ACCEPT_ATTR}
                    hidden={true}
                    onChange={e => {
                      const file = e.currentTarget.files?.[0] ?? null;
                      handleCollaboraFileSelect(file);
                      e.currentTarget.value = '';
                    }}
                  />
                </Button>
              )}
              <Typography variant="caption" color="text.secondary" textAlign="center">
                {t('callout.create.framingSettings.collaboraDocument.upload.maxSize', { cap: collaboraCapMb })}
              </Typography>
              {collaboraImportErrorMessage && (
                <Typography variant="caption" color="error" role="alert" textAlign="center">
                  {collaboraImportErrorMessage}
                </Typography>
              )}
            </Stack>
          )}
        </PageContentBlock>
      )}
    </>
  );
};

export default CalloutFormFramingSettings;
