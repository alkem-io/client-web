import { Presentation, Settings, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { LinkFramingFields } from '@/crd/forms/callout/LinkFramingFields';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { PollOptionsEditor } from '@/crd/forms/callout/PollOptionsEditor';
import { PollSettingsDialog } from '@/crd/forms/callout/PollSettingsDialog';
import { Button } from '@/crd/primitives/button';

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
}: FramingEditorConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'open' | 'closed' | null>(null);

  switch (framingType) {
    case 'whiteboard':
      return (
        <div className="p-4 border rounded-xl bg-muted/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}
            >
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{t('framing.newWhiteboard')}</p>
              <p className="text-xs text-muted-foreground">{t('framing.readyToCreate')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            {t('framing.configure')}
          </Button>
        </div>
      );

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
              <p className="font-medium text-sm">{t('framing.memo')}</p>
              <p className="text-xs text-muted-foreground">{t('framing.richTextEditor')}</p>
            </div>
          </div>
          {/* Tiptap editor will be rendered here by the integration layer */}
        </div>
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
