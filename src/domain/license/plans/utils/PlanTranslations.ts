import { useTranslation } from 'react-i18next';

interface PlanTranslation {
  name: string;
  displayName: string;
  priceDescription: string;
  features: string[];
  disclaimer: string;
  disabledDisclaimer?: string;
}

export const usePlanTranslations = () => {
  const { t } = useTranslation();

  const planTranslations: Record<string, PlanTranslation> = t('plansTable.plans', { returnObjects: true }).reduce(
    (acc, plan: PlanTranslation) => ({ ...acc, [plan.name]: plan }),
    {}
  );

  return planTranslations;
};
