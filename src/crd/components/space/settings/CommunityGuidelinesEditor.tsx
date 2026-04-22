import { Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { Button } from '@/crd/primitives/button';

export type CommunityGuidelinesEditorProps = {
  value: string;
  loading: boolean;
  submitting: boolean;
  canSave: boolean;
  onChange: (next: string) => void;
  onSave: () => void;
};

/**
 * Presentational editor for the Community Guidelines. Pure — all data and
 * mutations come via props (consumer owns the backing query/mutation).
 */
export function CommunityGuidelinesEditor({
  value,
  loading,
  submitting,
  canSave,
  onChange,
  onSave,
}: CommunityGuidelinesEditorProps) {
  const { t } = useTranslation('crd-spaceSettings');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <MarkdownEditor
        value={value}
        onChange={onChange}
        placeholder={t('community.guidelines.placeholder', {
          defaultValue: 'Describe your space’s code of conduct…',
        })}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption text-muted-foreground">
          {t('community.guidelines.hint', { defaultValue: 'Displayed to new members upon joining.' })}
        </p>
        <Button type="button" size="sm" onClick={onSave} disabled={!canSave} aria-busy={submitting}>
          {submitting ? (
            <>
              <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
              {t('community.guidelines.saving', { defaultValue: 'Saving…' })}
            </>
          ) : (
            <>
              <Save aria-hidden="true" className="mr-1.5 size-4" />
              {t('community.guidelines.save', { defaultValue: 'Save Guidelines' })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
