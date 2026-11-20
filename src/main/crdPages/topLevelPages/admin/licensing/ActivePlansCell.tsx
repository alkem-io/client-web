import { useTranslation } from 'react-i18next';
import { Badge } from '@/crd/primitives/badge';
import type { ActivePlan } from './licensingPlans';

/** Active plans as badges: plans `secondary`, feature flags `outline`. */
export function ActivePlansCell({ plans }: { plans: ActivePlan[] }) {
  const { t } = useTranslation('crd-admin');
  if (plans.length === 0) {
    return <span className="text-caption text-muted-foreground">{t('licensing.noPlans')}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {plans.map(plan => (
        <Badge key={plan.id} variant={plan.isFeatureFlag ? 'outline' : 'secondary'}>
          {plan.name}
        </Badge>
      ))}
    </div>
  );
}
