import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
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
  /** Whether the Form box starts collapsed for every viewer. */
  defaultCollapsed: boolean;
  onDefaultCollapsedChange: (value: boolean) => void;
  /**
   * Ask before widening "Admins only" to "Space members": the saved visibility is "Admins only" and the Form
   * has responses (or may have them). Narrowing never asks.
   */
  confirmWidening?: boolean;
  /** How many responses become readable by members; omitted when this editor cannot count them. */
  existingResponseCount?: number;
  /** The (sub)space whose members would read the responses. */
  spaceName?: string;
  readOnly?: boolean;
};

function OptionRow({
  id,
  value,
  label,
  description,
  disabled,
}: {
  id: string;
  value: string;
  label: string;
  description?: string;
  disabled: boolean;
}) {
  const descriptionId = `${id}-description`;
  return (
    <div className="flex items-start gap-3">
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        className="mt-1"
        aria-describedby={description ? descriptionId : undefined}
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
  defaultCollapsed,
  onDefaultCollapsedChange,
  confirmWidening = false,
  existingResponseCount,
  spaceName = '',
  readOnly = false,
}: FormSettingsDialogProps) {
  const { t } = useTranslation('crd-space');
  const [widenConfirmOpen, setWidenConfirmOpen] = useState(false);

  const handleVisibilityChange = (next: FormResponseVisibilityValue) => {
    // The radio group stays on the previous value until the widening is confirmed.
    if (next === 'MEMBERS' && visibility === 'ADMINS' && confirmWidening) {
      setWidenConfirmOpen(true);
      return;
    }
    onVisibilityChange(next);
  };

  return (
    <>
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
                onValueChange={value => handleVisibilityChange(value as FormResponseVisibilityValue)}
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
                  disabled={readOnly}
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
                  disabled={readOnly}
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

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="form-default-collapsed" className="text-body text-foreground">
                  {t('formForm.settings.defaultCollapsed')}
                </label>
                <Switch
                  id="form-default-collapsed"
                  checked={defaultCollapsed}
                  onCheckedChange={onDefaultCollapsedChange}
                  disabled={readOnly}
                  aria-describedby="form-default-collapsed-help"
                />
              </div>
              <p id="form-default-collapsed-help" className="text-caption text-muted-foreground">
                {t('formForm.settings.defaultCollapsedHelp')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={widenConfirmOpen}
        onOpenChange={setWidenConfirmOpen}
        title={t('formForm.settings.widenConfirm.title')}
        description={
          existingResponseCount === undefined
            ? t('formForm.settings.widenConfirm.descriptionNoCount', { space: spaceName })
            : t('formForm.settings.widenConfirm.description', { space: spaceName, count: existingResponseCount })
        }
        confirmLabel={t('formForm.settings.widenConfirm.confirm')}
        onConfirm={() => {
          setWidenConfirmOpen(false);
          onVisibilityChange('MEMBERS');
        }}
        onCancel={() => setWidenConfirmOpen(false)}
      />
    </>
  );
}
