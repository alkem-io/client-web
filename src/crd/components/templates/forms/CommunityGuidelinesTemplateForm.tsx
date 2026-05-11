import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import type { CommunityGuidelinesTemplateFormProps } from '../types';
import { ReferenceRowsEditor } from './ReferenceRowsEditor';

export function CommunityGuidelinesTemplateForm({ value, errors, onChange }: CommunityGuidelinesTemplateFormProps) {
  const { t } = useTranslation('crd-templates');
  const referenceErrors: Record<string, string | undefined> = {};
  for (const key of Object.keys(errors)) {
    if (key.startsWith('references.')) referenceErrors[key.slice('references.'.length)] = errors[key];
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cg-title">{t('form.communityGuidelines.title')}</Label>
        <Input
          id="cg-title"
          value={value.title}
          onChange={e => onChange({ ...value, title: e.target.value })}
          placeholder={t('form.communityGuidelines.titlePlaceholder')}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'cg-title-error' : undefined}
        />
        {errors.title && (
          <p id="cg-title-error" className="text-caption text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>{t('form.communityGuidelines.body')}</Label>
        <MarkdownEditor
          value={value.guidelinesMarkdown}
          onChange={guidelinesMarkdown => onChange({ ...value, guidelinesMarkdown })}
          placeholder={t('form.communityGuidelines.bodyPlaceholder')}
        />
      </div>

      <ReferenceRowsEditor
        value={value.references}
        onChange={references => onChange({ ...value, references })}
        errors={referenceErrors}
        label={t('form.communityGuidelines.references')}
      />
    </div>
  );
}
