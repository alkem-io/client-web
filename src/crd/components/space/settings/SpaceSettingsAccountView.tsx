import {
  Activity,
  AlertTriangle,
  Building,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Link2,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';

export type AccountPlan = {
  name: string;
  features: string[];
  daysLeft: number | null;
};

export type AccountVisibility = 'active' | 'archived' | 'demo' | 'inactive';

export type AccountHostType = 'organization' | 'user' | 'virtualContributor';

export type AccountHost = {
  displayName: string;
  avatarUrl: string | null;
  /** null when the host is another kind of actor: the type line is left out. */
  type: AccountHostType | null;
};

export type SpaceSettingsAccountViewProps = {
  url: string;
  plan: AccountPlan | null;
  visibility: AccountVisibility | null;
  host: AccountHost | null;
  contactSupportHref: string;
  changeLicenseHref: string | null;
  canDeleteSpace: boolean;
  loading?: boolean;
  onDeleteSpace: () => void;
  onCopyUrl: () => Promise<boolean> | boolean;
  className?: string;
};

export function SpaceSettingsAccountView({
  url,
  plan,
  visibility,
  host,
  contactSupportHref,
  changeLicenseHref,
  canDeleteSpace,
  loading,
  onDeleteSpace,
  onCopyUrl,
  className,
}: SpaceSettingsAccountViewProps) {
  const { t } = useTranslation('crd-spaceSettings');

  if (loading) {
    return <AccountSkeletons />;
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <SettingsSection
        title={t('account.url.title')}
        icon={<Link2 className="size-4" />}
        iconColor="blue"
        collapsible={false}
      >
        <div className="flex items-center gap-2">
          <Input
            id="space-url"
            value={url}
            readOnly={true}
            aria-label={t('account.url.title')}
            className="bg-muted/20 font-mono text-control flex-1"
          />
          <CopyUrlButton onCopyUrl={onCopyUrl} />
        </div>
        <p className="text-caption text-muted-foreground mt-2">{t('account.url.hint')}</p>
      </SettingsSection>

      <SettingsSection title={t('account.plan.title')} icon={<CreditCard className="size-4" />} iconColor="purple">
        <div className="space-y-4">
          {plan ? (
            <div>
              <Badge variant="secondary" className="px-3 py-1 font-semibold">
                {plan.name}
              </Badge>
            </div>
          ) : (
            <p className="text-body text-muted-foreground">{t('account.plan.none')}</p>
          )}
          {plan && plan.features.length > 0 && (
            <div className="space-y-3">
              <p className="text-body-emphasis text-muted-foreground">{t('account.plan.featuresHeading')}</p>
              {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
              {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
              <ul role="list" className="space-y-2 text-body">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check aria-hidden="true" className="size-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {plan && plan.daysLeft !== null && (
            <p className="text-caption text-muted-foreground">{t('account.plan.daysLeft', { count: plan.daysLeft })}</p>
          )}
          {changeLicenseHref && (
            <Button className="w-fit" variant="outline" size="sm" asChild={true}>
              <a href={changeLicenseHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                {t('account.plan.changeLicense')}
                <ExternalLink aria-hidden="true" className="size-3" />
              </a>
            </Button>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title={t('account.visibility.title')}
        icon={<Activity className="size-4" />}
        iconColor="green"
        collapsible={false}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-body">{t('account.visibility.prefix')}</p>
          {visibility && <Badge variant="secondary">{t(`account.visibility.status.${visibility}`)}</Badge>}
          <p className="text-body">{t('account.visibility.suffix')}</p>
        </div>
        <p className="text-caption text-muted-foreground mt-2">{t('account.visibility.contact')}</p>
      </SettingsSection>

      {host && (
        <SettingsSection title={t('account.host.title')} icon={<Shield className="size-4" />} iconColor="orange">
          <div className="flex items-center gap-4">
            <Avatar className="size-12 border">
              {host.avatarUrl ? <AvatarImage src={host.avatarUrl} alt="" /> : null}
              <AvatarFallback>{host.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-card-title">{host.displayName}</p>
              {host.type && (
                <div className="flex items-center gap-3 text-body text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {host.type === 'organization' ? (
                      <Building aria-hidden="true" className="size-3" />
                    ) : (
                      <User aria-hidden="true" className="size-3" />
                    )}
                    {t(`account.host.type.${host.type}`)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>
      )}

      {canDeleteSpace && (
        <SettingsSection
          title={t('account.dangerZone.title')}
          icon={<AlertTriangle className="size-4" />}
          iconColor="rose"
          defaultOpen={false}
          className="border-destructive/40"
        >
          <p className="text-body text-muted-foreground">{t('account.dangerZone.description')}</p>
          <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={onDeleteSpace}>
            <Trash2 aria-hidden="true" className="mr-1.5 size-3.5" />
            {t('account.dangerZone.delete')}
          </Button>
        </SettingsSection>
      )}

      <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/30 border border-dashed text-center gap-4">
        <p className="text-body text-muted-foreground">{t('account.support.message')}</p>
        <Button variant="default" className="gap-2" asChild={true}>
          <a href={contactSupportHref} target="_blank" rel="noopener noreferrer">
            {t('account.support.contact')}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function CopyUrlButton({ onCopyUrl }: { onCopyUrl: () => Promise<boolean> | boolean }) {
  const { t } = useTranslation('crd-spaceSettings');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await onCopyUrl();
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleCopy}
      className="shrink-0"
      aria-label={copied ? t('account.url.copied') : t('account.url.copy')}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-emerald-600" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
    </Button>
  );
}

function AccountSkeletons() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="h-4 w-24 rounded bg-muted mb-3" />
          <div className="h-3.5 w-[60%] rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
