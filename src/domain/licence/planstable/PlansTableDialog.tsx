import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, ButtonProps, Dialog, DialogActions, DialogContent, Theme, styled } from '@mui/material';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import RouterLink from '../../../core/ui/link/RouterLink';
import { Caption, CaptionSmall, Text } from '../../../core/ui/typography';
import GridContainer from '../../../core/ui/grid/GridContainer';
import GridItem from '../../../core/ui/grid/GridItem';
import { gutters } from '../../../core/ui/grid/utils';
import FullWidthButton from '../../../core/ui/button/FullWidthButton';
import useNavigate from '../../../core/routing/useNavigate';

interface PlanTranslation {
  id: string;
  name: string;
  price: string;
  pricePeriod: string;
  priceDescription: string;
  actionButton: string;
  dialogId?: string;
  actionUrl?: string;
  features: string[];
  disclaimer: string;
}

interface DialogTranslation {
  id: string;
  title: string;
  content: string;
  buttons: {
    caption: string;
    variant: string;
    planId?: string;
  }[];
}

const PlanName = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
  textAlign: 'center',
  margin: 0
}));

const Price = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const lines = (theme: Theme) => `1px solid ${theme.palette.divider}`;

const buttonVariant = (variant: string): ButtonProps['variant'] => {
  switch (variant) {
    case 'text':
      return 'text';
    case 'contained':
      return 'contained';
    case 'outlined':
      return 'outlined';
    default:
      return 'text';
  }
}

enum PlanSelected {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

const getPlanSelected = (plan: string): PlanSelected | undefined => {
  switch (plan) {
    case 'FREE':
      return PlanSelected.FREE;
    case 'PLUS':
      return PlanSelected.PLUS;
    case 'PREMIUM':
      return PlanSelected.PREMIUM;
    case 'ENTERPRISE':
      return PlanSelected.ENTERPRISE;
    default:
      return undefined;
  }
}

interface PlansTableDialogProps {
  open: boolean;
  onClose: () => void;
}

const PlansTableDialog = ({ open, onClose }: PlansTableDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [subDialogOpen, setSubDialogOpen] = useState<string>();
  const [planSelected, setPlanSelected] = useState<PlanSelected>();

  const pricingData: PlanTranslation[] = t('plansTable.plans', { returnObjects: true });
  const dialogs: DialogTranslation[] = t('plansTable.dialogs', { returnObjects: true });
  const handlePlanClick = (planSelected: PlanTranslation) => {
    const plan = getPlanSelected(planSelected.id);
    if (plan) {
      setPlanSelected(plan);
      if (planSelected.dialogId) {
        setSubDialogOpen(planSelected.dialogId);
      } else if (planSelected.actionUrl) {
        navigate(planSelected.actionUrl);
      }
    }
  };

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} columns={12}>
        <DialogHeader onClose={onClose}>{t('plansTable.title')}</DialogHeader>
        <GridContainer sameHeight noGap>
          {pricingData.map((plan, index) => (
            <GridItem key={index} columns={3}>
              <Box borderRight={lines} sx={{ '&:last-child': { borderRight: 'none' } }}>
                <Box borderBottom={lines} textAlign="center" padding={gutters()}>
                  <PlanName>{plan.name}</PlanName>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={gutters(0.5)} height={gutters(4)}>
                    <Price>{plan.price}</Price>
                    <Caption color={theme => theme.palette.neutral.light}>{plan.pricePeriod}</Caption>
                  </Box>
                  <Text textAlign="center" height={gutters(4)} color={theme => theme.palette.primary.main}>{plan.priceDescription}</Text>
                  <FullWidthButton variant="contained" onClick={() => handlePlanClick(plan)}>
                    <Caption textTransform="none">{plan.actionButton}</Caption>
                  </FullWidthButton>
                </Box>
                <Box paddingX={gutters()} color={theme => theme.palette.primary.main}>
                  <ul>
                    {plan.features.map((feature, index) => (
                      <li><Text key={index}>{feature}</Text></li>
                    ))}
                  </ul>
                </Box>
              </Box>
            </GridItem>
          ))}
        </GridContainer>
        <Box textAlign="center" margin={gutters()}>
          <CaptionSmall component={RouterLink} to={t('plansTable.seeMoreUrl')}>{t('plansTable.seeMore')}</CaptionSmall>
        </Box>
      </DialogWithGrid>
      {dialogs.map((dialog) => (
        <Dialog open={subDialogOpen === dialog.id} key={dialog.id}>
          <DialogHeader onClose={() => setSubDialogOpen(undefined)}>{dialog.title}</DialogHeader>
          <DialogContent>
            {dialog.content}
          </DialogContent>
          <DialogActions>
            {dialog.buttons.map((button, index) => (
              <Button key={index} variant={buttonVariant(button.variant)}>{button.caption}</Button>
            ))}
          </DialogActions>
        </Dialog>
      ))}
    </>
  );
};

export default PlansTableDialog;