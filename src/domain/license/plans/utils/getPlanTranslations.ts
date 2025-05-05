import type { TFunction } from 'i18next';

interface PlanTranslation {
  name: string;
  displayName: string;
  priceDescription: string;
  features: string[];
  disclaimer: string;
  disabledDisclaimer?: string;
}

export const getPlanTranslations = (t: TFunction): Record<string, PlanTranslation> => {
  const plans = t('plansTable.plans', { returnObjects: true });
  // Convert object to array if needed
  const plansArray = Array.isArray(plans) ? plans : Object.values(plans);
  return plansArray.reduce((acc, plan: PlanTranslation) => ({ ...acc, [plan.name]: plan }), {});
};
