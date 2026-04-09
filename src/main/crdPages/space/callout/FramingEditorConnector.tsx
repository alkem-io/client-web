import { Presentation, StickyNote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LinkFramingFields } from '@/crd/forms/callout/LinkFramingFields';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { PollOptionsEditor } from '@/crd/forms/callout/PollOptionsEditor';
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
}: FramingEditorConnectorProps) {
  const { t } = useTranslation('crd-space');

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
        <PollOptionsEditor
          question={pollQuestion}
          onQuestionChange={onPollQuestionChange}
          questionError={pollQuestionError}
          options={pollOptions}
          onOptionsChange={onPollOptionsChange}
        />
      );

    default:
      return null;
  }
}
