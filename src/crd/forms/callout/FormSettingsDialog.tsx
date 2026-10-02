import { useTranslation } from 'react-i18next';
import type { FormResponseModeValue, FormResponseVisibilityValue, FormStateValue } from '@/crd/forms/callout/types';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';
import { Separator } from '@/crd/primitives/separator';
import { Switch } from '@/crd/primitives/switch';

type FormSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibility: FormResponseVisibilityValue;
  onVisibilityChange: (value: FormResponseVisibilityValue) => void;
  responseMode: FormResponseModeValue;
  onResponseModeChange: (value: FormResponseModeValue) => void;
  state: FormStateValue;
  onStateChange: (value: FormStateValue) => void;
  /** Whether choosing the wider visibility ("Space members") is currently allowed. */
  canWidenVisibility: boolean;
  widenDisabledReason?: string;
  /** Whether choosing "one response per person" is currently allowed. */
  canSwitchToSingle: boolean;
  switchDisabledReason?: string;
  readOnly?: boolean;
};

function OptionRow({
  id,
  value,
  label,
  description,
  disabled,
  disabledReason,
}: {
  id: string;
  value: string;
  label: string;
  description?: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const reasonId = `${id}-reason`;
  const descriptionId = `${id}-description`;
  return (
    <div className="flex items-start gap-3">
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        className="mt-1"
        aria-describedby={
          [description ? descriptionId : undefined, disabledReason ? reasonId : undefined].filter(Boolean).join(' ') ||
          undefined
        }
      />
      <div className="space-y-0.5">
        <label htmlFor={id} className="text-body text-foreground">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-caption text-muted-foreground">
            {description}
          </p>
        )}
        {disabled && disabledReason && (
          <p id={reasonId} className="text-caption text-muted-foreground">
            {disabledReason}
          </p>
        )}
      </div>
    </div>
  );
}

export function FormSettingsDialog({
  open,
  onOpenChange,
  visibility,
  onVisibilityChange,
  responseMode,
  onResponseModeChange,
  state,
  onStateChange,
  canWidenVisibility,
  widenDisabledReason,
  canSwitchToSingle,
  switchDisabledReason,
  readOnly = false,
}: FormSettingsDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogTitle className="text-subsection-title shrink-0">{t('formForm.settings.title')}</DialogTitle>

        <Separator className="shrink-0" />

        <div className="space-y-5 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-3">
            <h3 id="form-settings-visibility" className="text-body-emphasis text-foreground">
              {t('formForm.settings.visibilityHeading')}
            </h3>
            <RadioGroup
              value={visibility}
              onValueChange={value => onVisibilityChange(value as FormResponseVisibilityValue)}
              aria-labelledby="form-settings-visibility"
              disabled={readOnly}
            >
              <OptionRow
                id="form-visibility-admins"
                value="ADMINS"
                label={t('formForm.settings.visibility.ADMINS')}
                description={t('formForm.settings.visibilityHelp.ADMINS')}
                disabled={readOnly}
              />
              <OptionRow
                id="form-visibility-members"
                value="MEMBERS"
                label={t('formForm.settings.visibility.MEMBERS')}
                description={t('formForm.settings.visibilityHelp.MEMBERS')}
                disabled={readOnly || !canWidenVisibility}
                disabledReason={widenDisabledReason}
              />
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 id="form-settings-mode" className="text-body-emphasis text-foreground">
              {t('formForm.settings.responseModeHeading')}
            </h3>
            <RadioGroup
              value={responseMode}
              onValueChange={value => onResponseModeChange(value as FormResponseModeValue)}
              aria-labelledby="form-settings-mode"
              disabled={readOnly}
            >
              <OptionRow
                id="form-mode-single"
                value="SINGLE"
                label={t('formForm.settings.responseMode.SINGLE')}
                disabled={readOnly || !canSwitchToSingle}
                disabledReason={switchDisabledReason}
              />
              <OptionRow
                id="form-mode-multiple"
                value="MULTIPLE"
                label={t('formForm.settings.responseMode.MULTIPLE')}
                disabled={readOnly}
              />
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="form-state-open" className="text-body text-foreground">
                {t('formForm.settings.stateOpen')}
              </label>
              <Switch
                id="form-state-open"
                checked={state === 'OPEN'}
                onCheckedChange={checked => onStateChange(checked ? 'OPEN' : 'CLOSED')}
                disabled={readOnly}
              />
            </div>
            <p className="text-caption text-muted-foreground">{t('formForm.settings.stateHelp')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
