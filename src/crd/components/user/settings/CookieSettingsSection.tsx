import { Cookie } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { CookieSaveError, CookieSettingsOptions } from '@/crd/components/common/CookieSettingsOptions';
import { SettingsSection } from '@/crd/components/common/SettingsSection';

type CookieSettingsSectionProps = ComponentProps<typeof CookieSettingsOptions> & {
  /** Shown as an alert below the options when a change could not be saved. */
  error?: string;
};

/**
 * The Security tab's Cookie settings card. No save button: the integration page stores each
 * Analytics change as it happens.
 */
export function CookieSettingsSection({ error, ...options }: CookieSettingsSectionProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <SettingsSection
      title={t('cookieConsent.settingsTitle')}
      description={t('cookieConsent.sectionDescription')}
      icon={<Cookie className="size-4" />}
      iconColor="orange"
    >
      <div className="flex flex-col gap-3">
        <CookieSettingsOptions {...options} />
        {error && <CookieSaveError message={error} />}
      </div>
    </SettingsSection>
  );
}
