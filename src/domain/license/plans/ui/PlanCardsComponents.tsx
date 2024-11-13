import { Box, styled, List, ListProps } from '@mui/material';
import { gutters } from '@core/ui/grid/utils';
import { Caption, Text } from '@core/ui/typography';
import { useTranslation } from 'react-i18next';

export const PlanName = styled('h1')<{ inline?: boolean }>(({ theme, inline }) => ({
  color: theme.palette.primary.main,
  textAlign: 'center',
  margin: 0,
  display: inline ? 'inline' : 'block',
  marginLeft: inline ? gutters(0.5)(theme) : 0,
  verticalAlign: inline ? 'bottom' : undefined,
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
  listItemComponent: ListItem = Text,
  sx,
  ...props
}: {
  planTranslation: {
    features: string[];
  };
  listItemComponent?: React.ElementType;
} & ListProps) => {
  const mergedSx: ListProps['sx'] = {
    listStyle: 'disc',
    marginLeft: gutters(),
    ...sx,
  };

  return (
    <List sx={mergedSx} {...props}>
      {planTranslation.features.map((feature, index) => (
        <ListItem component="li" display="list-item" key={index}>
          {feature}
        </ListItem>
      ))}
    </List>
  );
};

export const PlanFooter = styled(Box)(({ theme }) => ({
  margin: gutters(-1)(theme),
  marginTop: 'auto',
  padding: gutters(1)(theme),
  textAlign: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));
