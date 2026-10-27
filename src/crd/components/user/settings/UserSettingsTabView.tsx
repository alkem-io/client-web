import { Globe, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Switch } from '@/crd/primitives/switch';

const NS = 'crd-contributorSettings';

export type LanguageOption = {
  code: string;
  label: string;
};

export type UserSettingsTabViewProps = {
  loading: boolean;
  allowOtherUsersToSendMessages: boolean;
  // Email-contact toggle temporarily disabled client-side (chat-only).
  // allowOtherUsersToContactViaEmail: boolean;
  communicationSaving: boolean;
  onToggleAllowMessages: (next: boolean) => void;
  // onToggleAllowEmailContact: (next: boolean) => void;
  /** Current account language value (or platform default if not set). */
  currentLanguage: string;
  /** All available languages (full supportedLngs set — not just eligible). */
  availableLanguages: LanguageOption[];
  languageSaving: boolean;
  onLanguageChange: (languageCode: string) => void;
};

/**
 * User Settings tab — Communication (open) then Language (collapsed), as
 * collapsible `SettingsSection`s (spec 097 Session 2026-10-23). Every control
 * commits immediately.
 */
export function UserSettingsTabView(props: UserSettingsTabViewProps) {
  const { t } = useTranslation(NS);

  if (props.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title={t('user.settings.communication.title')}
        icon={<MessageSquare className="size-4" />}
        iconColor="blue"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-body">{t('user.settings.communication.allowMessagesLabel')}</p>
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
      </SettingsSection>

      {/* Language row (T011 — FR-011/FR-017) */}
      <SettingsSection
        title={t('user.settings.language.title')}
        icon={<Globe className="size-4" />}
        iconColor="green"
        defaultOpen={false}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-body">{t('user.settings.language.label')}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">{t('user.settings.language.description')}</p>
          </div>
          <Select value={props.currentLanguage} onValueChange={props.onLanguageChange} disabled={props.languageSaving}>
            <SelectTrigger className="w-[160px]" aria-label={t('user.settings.language.label')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {props.availableLanguages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SettingsSection>
    </div>
  );
}
