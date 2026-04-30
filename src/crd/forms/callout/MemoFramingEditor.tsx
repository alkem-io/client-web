import { StickyNote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';

type MemoFramingEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

/**
 * Inline memo framing editor shown on **create** (single-user mode). Wraps the
 * CRD `MarkdownEditor` with the memo icon + label and styling consistent with
 * the other framing cards (spec FR-21, plan D13). On **edit**, the connector
 * renders a read-only preview + Open-memo button instead (FR-21a / T048a).
 */
export function MemoFramingEditor({ value, onChange, disabled }: MemoFramingEditorProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className="space-y-3 p-4 border rounded-xl bg-muted/30 animate-in fade-in">
      <div className="flex items-center gap-2">
        <StickyNote className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-body-emphasis">{t('framing.memo')}</span>
      </div>
      <MarkdownEditor
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={t('framing.memoPlaceholder')}
      />
    </div>
  );
}
