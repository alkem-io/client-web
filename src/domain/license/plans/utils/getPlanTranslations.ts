import type { TFunction } from 'i18next';

type PlansTablePlansTranslation = {
  name: string;
  displayName: string;
  priceDescription: string;
  features: string[];
  disclaimer: string;
  disabledDisclaimer?: string;
};

export const getPlanTranslations = (t: TFunction): Record<string, PlansTablePlansTranslation> => {
  const plans = t('plansTable.plans', { returnObjects: true });
  // Convert object to array if needed
  const plansArray: PlansTablePlansTranslation[] = Array.isArray(plans) ? plans : Object.values(plans);
  return plansArray.reduce((acc, plan: PlansTablePlansTranslation) => ({ ...acc, [plan.name]: plan }), {});
};
