import { Box, styled } from '@mui/material';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption, Text } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

export const PlanName = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
  textAlign: 'center',
  margin: 0,
}));

const Price = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export const PlanPrice = ({
  plan,
}: {
  plan: {
    pricePerMonth?: number;
  };
}) => {
  const { t } = useTranslation();
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={gutters(0.5)} height={gutters(4)}>
      {plan.pricePerMonth === 0 ? (
        <>
          {/* Free Plan */}
          <Price>{plan.pricePerMonth} &euro;</Price>
          <Caption color={theme => theme.palette.neutral.light}>{t('plansTable.pricingPeriods.lifetime')}</Caption>
        </>
      ) : !plan.pricePerMonth ? (
        /* Enterprise Plan */
        <Caption color={theme => theme.palette.neutral.light}>{t('plansTable.pricingPeriods.custom')}</Caption>
      ) : (
        <>
          {/* Rest of the plans */}
          <Price>{plan.pricePerMonth} &euro;</Price>
          <Caption color={theme => theme.palette.neutral.light}>{t('plansTable.pricingPeriods.monthly')}</Caption>
        </>
      )}
    </Box>
  );
};

export const PlanFeatures = ({
  planTranslation,
  small,
}: {
  planTranslation: {
    features: string[];
  };
  small?: boolean;
}) => {
  return (
    <ul>
      {planTranslation.features.map((feature, index) => (
        <li key={index}>{small ? <Caption>{feature}</Caption> : <Text>{feature}</Text>}</li>
      ))}
    </ul>
  );
};
