import { Presentation, Settings, StickyNote } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { LinkFramingFields } from '@/crd/forms/callout/LinkFramingFields';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { PollOptionsEditor } from '@/crd/forms/callout/PollOptionsEditor';
import { PollSettingsDialog } from '@/crd/forms/callout/PollSettingsDialog';
import type { MediaGalleryFieldVisual } from '@/crd/forms/mediaGallery/MediaGalleryField';
import { Button } from '@/crd/primitives/button';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import CrdSingleUserWhiteboardDialog, {
  type WhiteboardWithContent,
} from '@/main/crdPages/whiteboard/CrdSingleUserWhiteboardDialog';
import { MediaGalleryFormFieldConnector } from './MediaGalleryFormFieldConnector';

const WHITEBOARD_FRAMING_TEMPLATE_ID = '__callout_framing_whiteboard';

type FramingEditorConnectorProps = {
  framingType: string;
  // Link fields
  linkUrl: string;
  onLinkUrlChange: (value: string) => void;
  linkUrlError?: string;
  linkDisplayName: string;
  onLinkDisplayNameChange: (value: string) => void;
  linkDisplayNameError?: string;
  // Poll fields
  pollQuestion: string;
  onPollQuestionChange: (value: string) => void;
  pollQuestionError?: string;
  pollOptions: PollOptionValue[];
  onPollOptionsChange: (options: PollOptionValue[]) => void;
  // Poll settings
  pollAllowMultiple?: boolean;
  onPollAllowMultipleChange?: (value: boolean) => void;
  pollAllowCustomOptions?: boolean;
  onPollAllowCustomOptionsChange?: (value: boolean) => void;
  pollHideResultsUntilVoted?: boolean;
  onPollHideResultsUntilVotedChange?: (value: boolean) => void;
  pollShowVoterAvatars?: boolean;
  onPollShowVoterAvatarsChange?: (value: boolean) => void;
  // Poll status (editing existing polls)
  pollStatus?: 'open' | 'closed';
  onPollStatusChange?: (status: 'open' | 'closed') => void;
  // Whiteboard framing
  whiteboardContent?: string;
  whiteboardPreviewSettings?: WhiteboardPreviewSettings;
  whiteboardConfigured?: boolean;
  whiteboardTitle?: string;
  onWhiteboardChange?: (
    content: string,
    previewImages: WhiteboardPreviewImage[] | undefined,
    previewSettings: WhiteboardPreviewSettings
  ) => void;
  // Media-gallery framing — required because a missing handler silently drops
  // user-selected files when `framingType === 'image'`.
  mediaGalleryVisuals: MediaGalleryFieldVisual[];
  onMediaGalleryVisualsChange: (next: MediaGalleryFieldVisual[]) => void;
};

export function FramingEditorConnector({
  framingType,
  linkUrl,
  onLinkUrlChange,
  linkUrlError,
  linkDisplayName,
  onLinkDisplayNameChange,
  linkDisplayNameError,
  pollQuestion,
  onPollQuestionChange,
  pollQuestionError,
  pollOptions,
  onPollOptionsChange,
  pollAllowMultiple = false,
  onPollAllowMultipleChange,
  pollAllowCustomOptions = false,
  onPollAllowCustomOptionsChange,
  pollHideResultsUntilVoted = false,
  onPollHideResultsUntilVotedChange,
  pollShowVoterAvatars = true,
  onPollShowVoterAvatarsChange,
  pollStatus,
  onPollStatusChange,
  whiteboardContent,
  whiteboardPreviewSettings,
  whiteboardConfigured,
  whiteboardTitle,
  onWhiteboardChange,
  mediaGalleryVisuals,
  onMediaGalleryVisualsChange,
}: FramingEditorConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'open' | 'closed' | null>(null);
  const [whiteboardEditorOpen, setWhiteboardEditorOpen] = useState(false);

  switch (framingType) {
    case 'whiteboard': {
      const templateWhiteboard: WhiteboardWithContent = {
        id: WHITEBOARD_FRAMING_TEMPLATE_ID,
        nameID: WHITEBOARD_FRAMING_TEMPLATE_ID,
        profile: {
          id: `${WHITEBOARD_FRAMING_TEMPLATE_ID}_profile`,
          displayName: whiteboardTitle || t('callout.whiteboard'),
          storageBucket: { id: '', allowedMimeTypes: [], maxFileSize: 0 },
        },
        content: whiteboardContent ?? EmptyWhiteboardString,
        previewSettings: whiteboardPreviewSettings ?? DefaultWhiteboardPreviewSettings,
      };

      return (
        <>
          <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}
              >
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <p className="text-body-emphasis">{t('framing.newWhiteboard')}</p>
                <p className="text-caption text-muted-foreground">
                  {whiteboardConfigured ? t('framing.configured') : t('framing.readyToCreate')}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setWhiteboardEditorOpen(true)}>
              {whiteboardConfigured ? t('framing.edit') : t('framing.configure')}
            </Button>
          </div>
          <Suspense fallback={<Loading />}>
            <CrdSingleUserWhiteboardDialog
              entities={{ whiteboard: templateWhiteboard }}
              actions={{
                onCancel: () => setWhiteboardEditorOpen(false),
                onUpdate: async (wb, previewImages) => {
                  onWhiteboardChange?.(wb.content, previewImages, wb.previewSettings);
                  setWhiteboardEditorOpen(false);
                },
              }}
              options={{
                show: whiteboardEditorOpen,
                canEdit: true,
                canDelete: false,
                fullscreen: true,
                allowFilesAttached: true,
                dialogTitle: whiteboardTitle || t('callout.whiteboard'),
              }}
            />
          </Suspense>
        </>
      );
    }

    case 'memo':
      return (
        <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'color-mix(in srgb, var(--chart-2) 15%, transparent)', color: 'var(--chart-2)' }}
            >
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-body-emphasis">{t('framing.memo')}</p>
              <p className="text-caption text-muted-foreground">{t('framing.richTextEditor')}</p>
            </div>
          </div>
          {/* Tiptap editor will be rendered here by the integration layer */}
        </div>
      );

    case 'image':
      return (
        <MediaGalleryFormFieldConnector visuals={mediaGalleryVisuals} onVisualsChange={onMediaGalleryVisualsChange} />
      );

    case 'cta':
      return (
        <LinkFramingFields
          url={linkUrl}
          onUrlChange={onLinkUrlChange}
          urlError={linkUrlError}
          displayName={linkDisplayName}
          onDisplayNameChange={onLinkDisplayNameChange}
          displayNameError={linkDisplayNameError}
        />
      );

    case 'poll':
      return (
        <>
          <PollOptionsEditor
            question={pollQuestion}
            onQuestionChange={onPollQuestionChange}
            questionError={pollQuestionError}
            options={pollOptions}
            onOptionsChange={onPollOptionsChange}
            pollStatus={pollStatus}
            onStatusChange={status => {
              setPendingStatus(status);
              setStatusConfirmOpen(true);
            }}
            isClosed={pollStatus === 'closed'}
            settingsSlot={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSettingsOpen(true)}
                aria-label={t('pollForm.settings')}
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
              </Button>
            }
          />
          <PollSettingsDialog
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            allowMultiple={pollAllowMultiple}
            onAllowMultipleChange={v => onPollAllowMultipleChange?.(v)}
            allowCustomOptions={pollAllowCustomOptions}
            onAllowCustomOptionsChange={v => onPollAllowCustomOptionsChange?.(v)}
            hideResultsUntilVoted={pollHideResultsUntilVoted}
            onHideResultsUntilVotedChange={v => onPollHideResultsUntilVotedChange?.(v)}
            showVoterAvatars={pollShowVoterAvatars}
            onShowVoterAvatarsChange={v => onPollShowVoterAvatarsChange?.(v)}
            readOnly={pollStatus === 'closed'}
          />
          {pendingStatus && (
            <ConfirmationDialog
              open={statusConfirmOpen}
              onOpenChange={setStatusConfirmOpen}
              title={
                pendingStatus === 'closed'
                  ? t('pollForm.closePollConfirm.title')
                  : t('pollForm.reopenPollConfirm.title')
              }
              description={
                pendingStatus === 'closed'
                  ? t('pollForm.closePollConfirm.description')
                  : t('pollForm.reopenPollConfirm.description')
              }
              confirmLabel={
                pendingStatus === 'closed'
                  ? t('pollForm.closePollConfirm.confirm')
                  : t('pollForm.reopenPollConfirm.confirm')
              }
              onConfirm={() => {
                onPollStatusChange?.(pendingStatus);
                setStatusConfirmOpen(false);
                setPendingStatus(null);
              }}
              onCancel={() => {
                setStatusConfirmOpen(false);
                setPendingStatus(null);
              }}
            />
          )}
        </>
      );

    default:
      return null;
  }
}
