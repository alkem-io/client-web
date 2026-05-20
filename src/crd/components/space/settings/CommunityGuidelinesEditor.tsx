import { Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReferenceRowsEditor } from '@/crd/components/templates/forms/ReferenceRowsEditor';
import type { ReferenceRow } from '@/crd/components/templates/types';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';

/** A related-link row on the community guidelines (mirrors the templates `ReferenceRow` shape). */
export type CommunityGuidelinesReferenceRow = ReferenceRow;

export type CommunityGuidelinesEditorValue = {
  /** The guidelines' title — `profile.displayName` (FR-038, a distinct field from the body). */
  title: string;
  /** The guidelines body — markdown. */
  body: string;
  references: CommunityGuidelinesReferenceRow[];
};

export type CommunityGuidelinesEditorProps = {
  value: CommunityGuidelinesEditorValue;
  loading: boolean;
  submitting: boolean;
  canSave: boolean;
  onChange: (patch: Partial<CommunityGuidelinesEditorValue>) => void;
  onSave: () => void;
  /** Open the "apply a community-guidelines template" picker. Hidden when not provided. */
  onApplyTemplate?: () => void;
  /** Open the "save these guidelines as a template" dialog. Hidden when not provided. */
  onSaveAsTemplate?: () => void;
} & MarkdownUploadProps;

/**
 * Presentational editor for the Community Guidelines (FR-038) — a title field, a markdown body, and a
 * related-links editor. Pure: all data + mutations flow via props. Optionally exposes "use a template"
 * / "save as a template" entry points (the consumer wires the picker / save-as dialog).
 */
export function CommunityGuidelinesEditor({
  value,
  loading,
  submitting,
  canSave,
  onChange,
  onSave,
  onApplyTemplate,
  onSaveAsTemplate,
  onImageUpload,
  iframeAllowedUrls,
  onError,
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
      {(onApplyTemplate || onSaveAsTemplate) && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onApplyTemplate && (
            <Button type="button" variant="outline" size="sm" onClick={onApplyTemplate} disabled={submitting}>
              {t('community.guidelines.applyTemplate')}
            </Button>
          )}
          {onSaveAsTemplate && (
            <Button type="button" variant="outline" size="sm" onClick={onSaveAsTemplate} disabled={submitting}>
              {t('community.guidelines.saveAsTemplate')}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="community-guidelines-title">{t('community.guidelines.titleLabel')}</Label>
        <Input
          id="community-guidelines-title"
          value={value.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder={t('community.guidelines.titlePlaceholder')}
        />
      </div>

      <MarkdownEditor
        value={value.body}
        onChange={body => onChange({ body })}
        placeholder={t('community.guidelines.placeholder')}
        onImageUpload={onImageUpload}
        iframeAllowedUrls={iframeAllowedUrls}
        onError={onError}
      />

      <ReferenceRowsEditor
        value={value.references}
        onChange={references => onChange({ references })}
        label={t('community.guidelines.referencesLabel')}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-caption text-muted-foreground">{t('community.guidelines.hint')}</p>
        <Button type="button" size="sm" onClick={onSave} disabled={!canSave} aria-busy={submitting}>
          {submitting ? (
            <>
              <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />
              {t('community.guidelines.saving')}
            </>
          ) : (
            <>
              <Save aria-hidden="true" className="mr-1.5 size-4" />
              {t('community.guidelines.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
