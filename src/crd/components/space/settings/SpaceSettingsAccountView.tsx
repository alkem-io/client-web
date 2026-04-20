import { AlertTriangle, ExternalLink, LifeBuoy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

export type AccountPlan = {
  name: string;
  features: string[];
  daysLeft: number | null;
};

export type AccountHost = {
  displayName: string;
  avatarUrl: string | null;
  type: string;
};

export type SpaceSettingsAccountViewProps = {
  url: string;
  plan: AccountPlan | null;
  visibility: string;
  host: AccountHost | null;
  contactSupportHref: string;
  changeLicenseHref: string | null;
  canDeleteSpace: boolean;
  loading?: boolean;
  onDeleteSpace: () => void;
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
  className,
}: SpaceSettingsAccountViewProps) {
  const { t } = useTranslation('crd-spaceSettings');

  if (loading) {
    return <AccountSkeletons />;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <h2 className="text-lg font-semibold">{t('account.pageHeader.title', { defaultValue: 'Account' })}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('account.pageHeader.subtitle', {
            defaultValue: 'Space URL, license plan, host info, and support.',
          })}
        </p>
      </div>

      {/* Space URL */}
      <InfoCard title={t('account.url.title', { defaultValue: 'Space URL' })}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline break-all"
        >
          {url}
        </a>
      </InfoCard>

      {/* Visibility */}
      <InfoCard title={t('account.visibility.title', { defaultValue: 'Visibility' })}>
        <Badge variant={visibility === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
          {visibility}
        </Badge>
      </InfoCard>

      {/* Host */}
      {host && (
        <InfoCard title={t('account.host.title', { defaultValue: 'Host' })}>
          <div className="flex items-center gap-3">
            {host.avatarUrl ? (
              <img src={host.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
            ) : (
              <div className="size-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold">
                {host.displayName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{host.displayName}</p>
              <p className="text-xs text-muted-foreground">{host.type}</p>
            </div>
          </div>
        </InfoCard>
      )}

      {/* License Plan */}
      {plan && (
        <InfoCard title={t('account.plan.title', { defaultValue: 'License Plan' })}>
          <p className="text-sm font-medium">{plan.name}</p>
          {plan.daysLeft !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              {t('account.plan.daysLeft', {
                defaultValue: '{{count}} days remaining',
                count: plan.daysLeft,
              })}
            </p>
          )}
          {plan.features.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {plan.features.map(f => (
                <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-muted-foreground shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}
          {changeLicenseHref && (
            <a
              href={changeLicenseHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
            >
              {t('account.plan.changeLicense', { defaultValue: 'Change License' })}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          )}
        </InfoCard>
      )}

      {/* Support */}
      <InfoCard title={t('account.support.title', { defaultValue: 'Support' })}>
        <a
          href={contactSupportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <LifeBuoy aria-hidden="true" className="size-3.5" />
          {t('account.support.contact', { defaultValue: 'Contact Alkemio Support' })}
        </a>
      </InfoCard>

      {/* Delete Space */}
      {canDeleteSpace && (
        <div className="rounded-xl border border-destructive/50 p-4">
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="size-4" />
            {t('account.dangerZone.title', { defaultValue: 'Danger Zone' })}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('account.dangerZone.description', {
              defaultValue: 'Permanently delete this space and all its content.',
            })}
          </p>
          <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={onDeleteSpace}>
            <Trash2 aria-hidden="true" className="mr-1.5 size-3.5" />
            {t('account.dangerZone.delete', { defaultValue: 'Delete this Space' })}
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function AccountSkeletons() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="rounded-xl border p-4">
          <div className="h-4 w-24 rounded bg-muted mb-3" />
          <div className="h-3.5 w-[60%] rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
