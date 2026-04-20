import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { Separator } from '@/crd/primitives/separator';
import { Switch } from '@/crd/primitives/switch';

type PollSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowMultiple: boolean;
  onAllowMultipleChange: (value: boolean) => void;
  allowCustomOptions: boolean;
  onAllowCustomOptionsChange: (value: boolean) => void;
  hideResultsUntilVoted: boolean;
  onHideResultsUntilVotedChange: (value: boolean) => void;
  showVoterAvatars: boolean;
  onShowVoterAvatarsChange: (value: boolean) => void;
  readOnly?: boolean;
};

export function PollSettingsDialog({
  open,
  onOpenChange,
  allowMultiple,
  onAllowMultipleChange,
  allowCustomOptions,
  onAllowCustomOptionsChange,
  hideResultsUntilVoted,
  onHideResultsUntilVotedChange,
  showVoterAvatars,
  onShowVoterAvatarsChange,
  readOnly = false,
}: PollSettingsDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-subsection-title">{t('pollForm.settings.title')}</DialogTitle>
          <DialogClose asChild={true}>
            <Button variant="ghost" size="sm" aria-label={t('pollForm.settings.close')}>
              {t('pollForm.settings.close')}
            </Button>
          </DialogClose>
        </div>

        <Separator />

        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-body-emphasis text-foreground">{t('pollForm.settings.votingOptions')}</h3>
            <SettingRow
              label={t('pollForm.settings.allowMultiple')}
              checked={allowMultiple}
              onCheckedChange={onAllowMultipleChange}
              disabled={readOnly}
            />
            <SettingRow
              label={t('pollForm.settings.allowCustomOptions')}
              checked={allowCustomOptions}
              onCheckedChange={onAllowCustomOptionsChange}
              disabled={readOnly}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-body-emphasis text-foreground">{t('pollForm.settings.displayOptions')}</h3>
            <SettingRow
              label={t('pollForm.settings.hideResultsUntilVoted')}
              checked={hideResultsUntilVoted}
              onCheckedChange={onHideResultsUntilVotedChange}
              disabled={readOnly}
            />
            <SettingRow
              label={t('pollForm.settings.showVoterAvatars')}
              checked={showVoterAvatars}
              onCheckedChange={onShowVoterAvatarsChange}
              disabled={readOnly}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingRow({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-body text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-label={label} />
    </div>
  );
}
