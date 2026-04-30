import { useTranslation } from 'react-i18next';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';

type AllowCommentsFieldProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

/**
 * Framing-level "Allow Comments" toggle (spec FR-09, T024a). Distinct from the
 * contribution-level Posts comments switch in FR-32 — this one controls whether
 * comments are enabled on the callout framing itself, regardless of the
 * chosen response type.
 */
export function AllowCommentsField({ value, onChange, disabled }: AllowCommentsFieldProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="framing-allow-comments" className="text-body text-foreground">
          {t('forms.allowComments')}
        </Label>
        <p className="text-caption text-muted-foreground">{t('forms.allowCommentsDescription')}</p>
      </div>
      <Switch
        id="framing-allow-comments"
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={t('forms.allowComments')}
      />
    </div>
  );
}
