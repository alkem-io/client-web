import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

export type UserSettingsTabViewProps = {
  loading: boolean;
  allowOtherUsersToSendMessages: boolean;
  // Email-contact toggle temporarily disabled client-side (chat-only).
  // allowOtherUsersToContactViaEmail: boolean;
  communicationSaving: boolean;
  onToggleAllowMessages: (next: boolean) => void;
  // onToggleAllowEmailContact: (next: boolean) => void;
};

export function UserSettingsTabView(props: UserSettingsTabViewProps) {
  const { t } = useTranslation(NS);

  if (props.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard icon={MessageSquare} title={t('user.settings.communication.title')}>
        <div className="space-y-4">
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

          {/*
            Email-contact toggle temporarily DISABLED client-side (chat-only).
            To re-enable, uncomment this block and restore the
            `allowOtherUsersToContactViaEmail` / `onToggleAllowEmailContact`
            props above and in CrdUserSettingsTab.tsx.
          <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
            <div className="flex-1">
              <p className="text-body-emphasis">{t('user.settings.communication.allowEmailContactLabel')}</p>
              <p className="mt-0.5 text-caption text-muted-foreground">
                {t('user.settings.communication.allowEmailContactDescription')}
              </p>
            </div>
            <Switch
              checked={props.allowOtherUsersToContactViaEmail}
              disabled={props.communicationSaving}
              onCheckedChange={props.onToggleAllowEmailContact}
              aria-label={t('user.settings.communication.allowEmailContactLabel')}
            />
          </div>
          */}
        </div>
      </SettingsCard>
    </div>
  );
}
