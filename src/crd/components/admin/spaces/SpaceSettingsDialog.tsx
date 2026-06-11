import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

export type SpaceVisibilityOption = { value: string; label: string };

type SpaceSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The space alias (nameID). */
  nameId: string;
  visibility: string;
  visibilityOptions: SpaceVisibilityOption[];
  onNameIdChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
  onSave: () => void;
  saving?: boolean;
  canUpdate?: boolean;
};

/**
 * Platform-admin space settings — edit the space alias (nameID) and visibility.
 * Mirrors the MUI `SpaceSettingsDialog` (alias + visibility); license-plan
 * management is a separate row action. Pure presentation.
 */
export function SpaceSettingsDialog({
  open,
  onOpenChange,
  nameId,
  visibility,
  visibilityOptions,
  onNameIdChange,
  onVisibilityChange,
  onSave,
  saving = false,
  canUpdate = true,
}: SpaceSettingsDialogProps) {
  const { t } = useTranslation('crd-admin');
  const aliasId = useId();
  const visibilityId = useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('spaces.settingsTitle')}</DialogTitle>
          <DialogDescription>{t('spaces.settingsDescription')}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={event => {
            event.preventDefault();
            onSave();
          }}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor={aliasId} className="text-body-emphasis">
              {t('spaces.aliasLabel')}
            </label>
            <Input
              id={aliasId}
              value={nameId}
              onChange={event => onNameIdChange(event.target.value)}
              disabled={saving || !canUpdate}
              required={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={visibilityId} className="text-body-emphasis">
              {t('spaces.visibilityLabel')}
            </label>
            <Select value={visibility} onValueChange={onVisibilityChange} disabled={saving || !canUpdate}>
              <SelectTrigger id={visibilityId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              {t('spaces.cancel')}
            </Button>
            <Button type="submit" disabled={saving || !canUpdate || !nameId.trim()} aria-busy={saving}>
              {t('spaces.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
