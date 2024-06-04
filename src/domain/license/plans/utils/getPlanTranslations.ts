import { TFunction } from 'react-i18next';

interface PlanTranslation {
  name: string;
  displayName: string;
  priceDescription: string;
  features: string[];
  disclaimer: string;
  disabledDisclaimer?: string;
}

export const getPlanTranslations = (t: TFunction<'translation', undefined>): Record<string, PlanTranslation> => {
  return t('plansTable.plans', { returnObjects: true }).reduce(
    (acc, plan: PlanTranslation) => ({ ...acc, [plan.name]: plan }),
    {}
  );
};
