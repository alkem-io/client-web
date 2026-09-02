import { Loader2, Pencil } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Loading } from '@/crd/components/common/Loading';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type InlineEditMarkdownLabels = {
  /** aria-label for the pencil edit trigger. */
  edit: string;
  /** Read-view text shown when the value is empty. */
  empty: string;
  /** Placeholder shown inside the markdown editor. */
  placeholder: string;
  save: string;
  cancel: string;
  saving: string;
};

export type InlineEditMarkdownProps = MarkdownUploadProps & {
  /** Current markdown value (rendered read-only until the pencil is clicked). */
  value: string;
  /** Persists the edit. Resolves `true` on success (collapses back to the read
   *  view) or `false` on failure (stays in edit mode, preserving the draft). */
  onSave: (next: string) => Promise<boolean>;
  labels: InlineEditMarkdownLabels;
  maxLength?: number;
  className?: string;
};

/**
 * Inline markdown field with a pencil-to-edit affordance — the markdown
 * equivalent of `InlineEditText`. Read view renders the value via
 * `MarkdownContent` with a faded pencil button; clicking it swaps in a
 * `MarkdownEditor` with explicit Save / Cancel (markdown can't auto-commit on
 * blur the way a plain input does). Pure presentational: all behaviour arrives
 * via props.
 */
export function InlineEditMarkdown({
  value,
  onSave,
  labels,
  maxLength,
  className,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: InlineEditMarkdownProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const dirty = draft.trim() !== value.trim();

  const startEdit = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!dirty) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok) setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className={cn('flex items-start gap-2', className)}>
        <div className="min-w-0 flex-1">
          {value ? (
            <MarkdownContent content={value} className="text-body text-foreground" />
          ) : (
            <p className="text-body text-muted-foreground italic">{labels.empty}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={startEdit}
          aria-label={labels.edit}
          className="shrink-0 text-muted-foreground/60 hover:text-foreground"
        >
          <Pencil aria-hidden="true" className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Suspense fallback={<Loading />}>
        <MarkdownEditor
          value={draft}
          onChange={setDraft}
          placeholder={labels.placeholder}
          maxLength={maxLength}
          disabled={saving}
          onImageUpload={onImageUpload}
          iframeAllowedUrls={iframeAllowedUrls}
          onError={onError}
        />
      </Suspense>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={saving}>
          {labels.cancel}
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving || !dirty} aria-busy={saving}>
          {saving ? <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" /> : null}
          {saving ? labels.saving : labels.save}
        </Button>
      </div>
    </div>
  );
}
