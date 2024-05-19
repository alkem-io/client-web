import React, { useEffect, useState } from 'react';
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
import { Plan, getPlanFromId } from './Plan';
import { usePlanAvailability } from './usePlanAvailability';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import Gutters from '../../../core/ui/grid/Gutters';

interface PlanTranslation {
  id: string;
  name: string;
  price: string;
  pricePeriod: string;
  priceDescription: string;
  buttonCaption: string;
  buttonHighlighted?: boolean;
  dialogId?: string;
  actionUrl?: string;
  features: string[];
  disclaimer: string;
  disabledDisclaimer?: string;
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
  margin: 0,
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
      return undefined;
  }
};

const buttonStyle = (highlighted: boolean = false): ButtonProps['sx'] => {
  return highlighted
    ? {
        backgroundColor: theme => theme.palette.highlight.dark,
        color: theme => theme.palette.neutral.main,
        '&:hover': {
          backgroundColor: theme => theme.palette.highlight.dark,
        },
      }
    : undefined;
};

interface PlansTableDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: Plan) => void;
}

const PlansTableDialog = ({ open, onClose, onSelectPlan }: PlansTableDialogProps) => {
  const { t } = useTranslation();

  const { isPlanAvailable } = usePlanAvailability();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<string>();
  // Keep the first plan clicked here to be used in case in the Confirmation Dialog there is no planId
  const [planSelected, setPlanSelected] = useState<Plan>();

  useEffect(() => {
    if (!open && confirmDialogOpen) {
      // Close any confirmation dialog if the main dialog is closed
      setConfirmDialogOpen(undefined);
    }
  }, [open]);

  const pricingData: PlanTranslation[] = t('plansTable.plans', { returnObjects: true });
  const confirmDialogs: DialogTranslation[] = t('plansTable.dialogs', { returnObjects: true });

  const handlePlanClick = (planSelected: PlanTranslation) => {
    const plan = getPlanFromId(planSelected.id);
    if (plan) {
      setPlanSelected(plan);
      if (planSelected.dialogId) {
        setConfirmDialogOpen(planSelected.dialogId);
      } else {
        onSelectPlan(plan);
      }
    }
  };

  const handleDialogButtonClick = (planId: string | undefined) => {
    const plan: Plan | undefined = planId ? getPlanFromId(planId) : undefined;
    if (plan) {
      onSelectPlan(plan);
    } else if (planSelected) {
      onSelectPlan(planSelected);
    }
  };

  const isPlanDisabled = (planId: string): boolean => {
    const plan = getPlanFromId(planId);
    if (plan) {
      return !isPlanAvailable(plan);
    }
    return true;
  };

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} columns={12}>
        <DialogHeader onClose={onClose}>{t('plansTable.title')}</DialogHeader>
        <Gutters>
          <Caption>{t('plansTable.subtitle')}</Caption>
          <GridContainer sameHeight disablePadding noGap>
            {pricingData.map((plan, index) => (
              <GridItem key={index} columns={3}>
                <Box
                  borderRight={lines}
                  sx={{ '&:last-child': { borderRight: 'none' }, '&:first-child': { marginLeft: gutters(1.5) } }}
                >
                  <Box borderBottom={lines} textAlign="center" paddingBottom={gutters()} paddingX={gutters()}>
                    <PlanName>{plan.name}</PlanName>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={gutters(0.5)}
                      height={gutters(4)}
                    >
                      <Price>{plan.price}</Price>
                      <Caption color={theme => theme.palette.neutral.light}>{plan.pricePeriod}</Caption>
                    </Box>
                    <Text textAlign="center" height={gutters(4)} color={theme => theme.palette.primary.main}>
                      {plan.priceDescription}
                    </Text>
                    {plan.actionUrl ? (
                      <FullWidthButton
                        variant="contained"
                        component={RouterLink}
                        disabled={isPlanDisabled(plan.id)}
                        sx={buttonStyle(plan.buttonHighlighted)}
                        to={plan.actionUrl}
                        target="_blank"
                      >
                        <Caption textTransform="none">{plan.buttonCaption}</Caption>
                      </FullWidthButton>
                    ) : (
                      <FullWidthButton
                        variant="contained"
                        onClick={() => handlePlanClick(plan)}
                        disabled={isPlanDisabled(plan.id)}
                        sx={buttonStyle(plan.buttonHighlighted)}
                      >
                        <Caption textTransform="none">{plan.buttonCaption}</Caption>
                      </FullWidthButton>
                    )}
                  </Box>
                  <Box paddingX={gutters()} color={theme => theme.palette.primary.main}>
                    {
                      <>
                        <ul>
                          {plan.features.map((feature, index) => (
                            <li>
                              <Text key={index}>{feature}</Text>
                            </li>
                          ))}
                        </ul>
                        {!isPlanDisabled(plan.id) && <Caption>{plan.disclaimer}</Caption>}
                        {isPlanDisabled(plan.id) && <Caption>{plan.disabledDisclaimer}</Caption>}
                      </>
                    }
                  </Box>
                </Box>
              </GridItem>
            ))}
          </GridContainer>
          <Box textAlign="center">
            <CaptionSmall component={RouterLink} to={t('plansTable.seeMoreUrl')}>
              {t('plansTable.seeMore')}
            </CaptionSmall>
          </Box>
        </Gutters>
      </DialogWithGrid>
      {confirmDialogs.map(dialog => (
        <Dialog open={confirmDialogOpen === dialog.id} key={dialog.id}>
          <DialogHeader onClose={() => setConfirmDialogOpen(undefined)}>{dialog.title}</DialogHeader>
          <DialogContent>
            <WrapperMarkdown>{dialog.content}</WrapperMarkdown>
          </DialogContent>
          <DialogActions>
            {dialog.buttons.map((button, index) => (
              <Button
                key={index}
                variant={buttonVariant(button.variant)}
                onClick={() => handleDialogButtonClick(button.planId)}
              >
                {button.caption}
              </Button>
            ))}
          </DialogActions>
        </Dialog>
      ))}
    </>
  );
};

export default PlansTableDialog;
