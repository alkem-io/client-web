import { useTranslation } from 'react-i18next';
import { Label } from '@/crd/primitives/label';
import { Switch } from '@/crd/primitives/switch';
import type { AllowedActors } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

type ActorSwitchesProps = {
  value: AllowedActors;
  onChange: (next: AllowedActors) => void;
  disabled?: boolean;
};

/**
 * Two-switch "Members can add" / "Admins can add" with the hierarchy rule baked
 * in (plan D4):
 *
 * - If `admins` goes OFF, `members` is forced OFF and its switch is disabled.
 * - If `members` goes ON, `admins` is forced ON.
 * - `{ members: true, admins: false }` is unreachable.
 */
export function ActorSwitches({ value, onChange, disabled }: ActorSwitchesProps) {
  const { t } = useTranslation('crd-space');

  const handleMembersChange = (checked: boolean) => {
    if (checked) {
      // Turning members ON forces admins ON.
      onChange({ members: true, admins: true });
    } else {
      onChange({ ...value, members: false });
    }
  };

  const handleAdminsChange = (checked: boolean) => {
    if (checked) {
      onChange({ ...value, admins: true });
    } else {
      // Turning admins OFF forces members OFF too (hierarchy).
      onChange({ members: false, admins: false });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="actors-members" className="text-body text-foreground">
          {t('contributionSettings.actors.members')}
        </Label>
        <Switch
          id="actors-members"
          checked={value.members}
          onCheckedChange={handleMembersChange}
          disabled={disabled || !value.admins}
          aria-label={t('contributionSettings.actors.members')}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="actors-admins" className="text-body text-foreground">
          {t('contributionSettings.actors.admins')}
        </Label>
        <Switch
          id="actors-admins"
          checked={value.admins}
          onCheckedChange={handleAdminsChange}
          disabled={disabled}
          aria-label={t('contributionSettings.actors.admins')}
        />
      </div>
    </div>
  );
}
