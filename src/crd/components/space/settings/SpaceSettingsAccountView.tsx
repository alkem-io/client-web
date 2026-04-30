import {
  Activity,
  AlertTriangle,
  Building,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/crd/primitives/card';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Separator } from '@/crd/primitives/separator';

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
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Page header */}
      <div>
        <h2 className="text-page-title">{t('account.pageHeader.title')}</h2>
        <p className="text-sm text-muted-foreground mt-2">{t('account.pageHeader.subtitle')}</p>
      </div>

      <Separator />

      {/* URL */}
      <div className="grid gap-2">
        <Label htmlFor="space-url" className="text-base">
          {t('account.url.title')}
        </Label>
        <div className="flex items-center gap-2 max-w-xl">
          <Input id="space-url" value={url} readOnly={true} className="bg-muted/20 font-mono text-sm flex-1" />
          <CopyUrlButton onCopyUrl={onCopyUrl} />
        </div>
        <p className="text-sm text-muted-foreground italic">{t('account.url.hint')}</p>
      </div>

      {/* License */}
      {plan && (
        <Card className="bg-muted/10 border-muted/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard aria-hidden="true" className="size-5 text-primary" />
                <CardTitle className="text-lg">{t('account.plan.title')}</CardTitle>
              </div>
              <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10">
                {plan.name}
              </Badge>
            </div>
            <CardDescription>{t('account.plan.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.features.length > 0 && (
              <div className="space-y-3">
                <p className="text-body-emphasis text-muted-foreground">{t('account.plan.featuresHeading')}</p>
                <ul className="space-y-2 text-sm">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <Check aria-hidden="true" className="size-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {plan.daysLeft !== null && (
              <p className="text-xs text-muted-foreground">{t('account.plan.daysLeft', { count: plan.daysLeft })}</p>
            )}
          </CardContent>
          {changeLicenseHref && (
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t bg-muted/20 rounded-b-xl">
              <Button variant="outline" className="w-full sm:w-auto text-sm" asChild={true}>
                <a
                  href={changeLicenseHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  {t('account.plan.changeLicense')}
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Visibility */}
      <div className="grid gap-2 p-4 border rounded-lg bg-card">
        <Label className="text-base flex items-center gap-2">
          <Activity aria-hidden="true" className="size-4 text-primary" />
          {t('account.visibility.title')}
        </Label>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <p className="text-sm">{t('account.visibility.prefix')}</p>
          <Badge className="bg-primary/15 text-primary hover:bg-primary/25 border-primary/20">{visibility}</Badge>
          <p className="text-sm">{t('account.visibility.suffix')}</p>
        </div>
        <p className="text-xs text-muted-foreground italic pt-1">{t('account.visibility.contact')}</p>
      </div>

      {/* Host */}
      {host && (
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Shield aria-hidden="true" className="size-5 text-primary" />
              <CardTitle className="text-lg">{t('account.host.title')}</CardTitle>
            </div>
            <CardDescription>{t('account.host.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="size-12 border">
                {host.avatarUrl ? <AvatarImage src={host.avatarUrl} alt="" /> : null}
                <AvatarFallback>{host.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-medium text-base">{host.displayName}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    {host.type.toLowerCase().includes('org') ? (
                      <Building aria-hidden="true" className="size-3" />
                    ) : (
                      <User aria-hidden="true" className="size-3" />
                    )}
                    {host.type}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support / Contact */}
      <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/30 border border-dashed text-center gap-4">
        <p className="text-sm text-muted-foreground">{t('account.support.message')}</p>
        <Button variant="default" className="gap-2" asChild={true}>
          <a href={contactSupportHref} target="_blank" rel="noopener noreferrer">
            {t('account.support.contact')}
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </Button>
      </div>

      {/* Danger Zone */}
      {canDeleteSpace && (
        <div className="rounded-xl border border-destructive/50 p-4">
          <h3 className="text-card-title text-destructive flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="size-4" />
            {t('account.dangerZone.title')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{t('account.dangerZone.description')}</p>
          <Button type="button" variant="destructive" size="sm" className="mt-3" onClick={onDeleteSpace}>
            <Trash2 aria-hidden="true" className="mr-1.5 size-3.5" />
            {t('account.dangerZone.delete')}
          </Button>
        </div>
      )}
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
