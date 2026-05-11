import { MessageSquare, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

export type UserSettingsTabViewProps = {
  loading: boolean;
  // Communication & Privacy
  allowOtherUsersToSendMessages: boolean;
  communicationSaving: boolean;
  onToggleAllowMessages: (next: boolean) => void;
  // Design System (localStorage; reload on change)
  crdEnabled: boolean;
  onToggleCrdDesign: (next: boolean) => void;
};

/**
 * User Settings tab — presentational view. Two `SettingsCard`s:
 *
 * 1. **Communication & Privacy** — single Switch wired to
 *    `updateUserSettings` via the parent (optimistic + hard-failure revert
 *    per FR-133).
 * 2. **Design System** — single Switch that writes the viewer's own
 *    browser localStorage and reloads the page (FR-071 / FR-073). Always
 *    reads the LOCAL toggle state — never a server-stored attribute,
 *    even when a platform admin views another user's profile.
 *
 * Pure presentational. Both Switches commit via callback props.
 */
export function UserSettingsTabView(props: UserSettingsTabViewProps) {
  const { t } = useTranslation(NS);

  if (props.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard icon={MessageSquare} title={t('user.settings.communication.title')}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body-emphasis">{t('user.settings.communication.allowMessagesLabel')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {t('user.settings.communication.allowMessagesDescription')}
            </p>
          </div>
          <Switch
            checked={props.allowOtherUsersToSendMessages}
            disabled={props.communicationSaving}
            onCheckedChange={props.onToggleAllowMessages}
            aria-label={t('user.settings.communication.allowMessagesLabel')}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Palette}
        title={t('user.settings.designSystem.title')}
        description={t('user.settings.designSystem.description')}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body-emphasis">{t('user.settings.designSystem.toggleLabel')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">{t('user.settings.designSystem.reloadCaption')}</p>
          </div>
          <Switch
            checked={props.crdEnabled}
            onCheckedChange={props.onToggleCrdDesign}
            aria-label={t('user.settings.designSystem.toggleLabel')}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
