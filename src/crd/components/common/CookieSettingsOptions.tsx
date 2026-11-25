import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/crd/primitives/switch';

type CookieSettingsOptionsProps = {
  analysis: boolean;
  onAnalysisChange: (analysis: boolean) => void;
  cookiePolicyHref: string;
  privacyPolicyHref?: string;
};

type OptionRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Shown below the switch, e.g. "Always on" for the category that cannot be turned off. */
  note?: string;
};

function OptionRow({ title, description, checked, onCheckedChange, note }: OptionRowProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={`${id}-switch`} className="text-body-emphasis">
          {title}
        </label>
        <p id={`${id}-description`} className="text-caption text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <Switch
          id={`${id}-switch`}
          aria-describedby={`${id}-description`}
          checked={checked}
          disabled={!onCheckedChange}
          onCheckedChange={onCheckedChange}
        />
        {note && <span className="text-caption text-muted-foreground">{note}</span>}
      </div>
    </div>
  );
}

const linkClassName =
  'rounded-sm text-body-emphasis text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring';

function PolicyLink({ href, label }: { href: string; label: string }) {
  const { t } = useTranslation('crd-layout');
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {label}
      <span className="sr-only"> ({t('footer.opensInNewTab')})</span>
    </a>
  );
}

/**
 * The two cookie categories (Necessary, always on; Analytics, a switch) and the policy links.
 * Shared by the Cookie settings sheet and the Security tab's cookie section.
 */
export function CookieSettingsOptions({
  analysis,
  onAnalysisChange,
  cookiePolicyHref,
  privacyPolicyHref,
}: CookieSettingsOptionsProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col divide-y divide-border">
        <OptionRow
          title={t('cookieConsent.necessary')}
          description={t('cookieConsent.necessaryDescription')}
          checked={true}
          note={t('cookieConsent.alwaysOn')}
        />
        <OptionRow
          title={t('cookieConsent.analytics')}
          description={t('cookieConsent.analyticsDescription')}
          checked={analysis}
          onCheckedChange={onAnalysisChange}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <PolicyLink href={cookiePolicyHref} label={t('cookieConsent.cookiePolicy')} />
        {privacyPolicyHref && <PolicyLink href={privacyPolicyHref} label={t('cookieConsent.privacyPolicy')} />}
      </div>
    </div>
  );
}
