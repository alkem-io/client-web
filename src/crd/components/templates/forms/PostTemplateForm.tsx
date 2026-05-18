import { useTranslation } from 'react-i18next';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { Label } from '@/crd/primitives/label';
import type { PostTemplateFormProps } from '../types';

export function PostTemplateForm({ value, onChange }: PostTemplateFormProps) {
  const { t } = useTranslation('crd-templates');
  return (
    <div className="space-y-1.5">
      <Label>{t('form.post.defaultDescription')}</Label>
      <MarkdownEditor
        value={value.defaultDescription}
        onChange={defaultDescription => onChange({ ...value, defaultDescription })}
        placeholder={t('form.post.defaultDescriptionPlaceholder')}
      />
    </div>
  );
}
