import { CheckCircle2, Clock, ShieldOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

const NS = 'crd-contributorSettings';

export type OrgVerificationStatus = 'verified' | 'pending' | 'notVerified';

export type OrgVerifiedBadgeProps = {
  status: OrgVerificationStatus;
  className?: string;
};

/**
 * Read-only verification badge for organization profiles (Decision #12 /
 * FR-094). Three states driven by the GraphQL
 * `Organization.verification.status` enum:
 *
 * - **verified** (`VerifiedManualAttestation`) — green tile + check icon.
 * - **pending** (`VerificationPending`) — muted tile + clock icon.
 * - **notVerified** (`NotVerified`) — muted tile + shield-off icon.
 *
 * The badge has **no edit affordance** — verification is managed by
 * platform admins via a separate flow (out of scope for this spec).
 */
export function OrgVerifiedBadge({ status, className }: OrgVerifiedBadgeProps) {
  const { t } = useTranslation(NS);

  const config = (() => {
    switch (status) {
      case 'verified':
        return {
          Icon: CheckCircle2,
          label: t('org.profile.verification.verified'),
          tileClass: 'bg-emerald-500/10 text-emerald-600',
        };
      case 'pending':
        return {
          Icon: Clock,
          label: t('org.profile.verification.pending'),
          tileClass: 'bg-amber-500/10 text-amber-600',
        };
      case 'notVerified':
        return {
          Icon: ShieldOff,
          label: t('org.profile.verification.notVerified'),
          tileClass: 'bg-muted text-muted-foreground',
        };
    }
  })();

  return (
    <output
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-0 px-2 py-0.5 text-caption font-medium',
        config.tileClass,
        className
      )}
      aria-label={config.label}
    >
      <config.Icon aria-hidden="true" className="size-3.5" />
      {config.label}
    </output>
  );
}
