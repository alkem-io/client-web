import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  Theme,
  styled,
  useMediaQuery,
} from '@mui/material';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import RouterLink from '../../../core/ui/link/RouterLink';
import { Caption, CaptionSmall, Text } from '../../../core/ui/typography';
import GridContainer from '../../../core/ui/grid/GridContainer';
import GridItem from '../../../core/ui/grid/GridItem';
import { gutters } from '../../../core/ui/grid/utils';
import FullWidthButton from '../../../core/ui/button/FullWidthButton';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import Gutters from '../../../core/ui/grid/Gutters';
import { usePlansTableQuery } from '../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../core/ui/loading/Loading';

interface PlanTranslation {
  name: string;
  displayName: string;
  priceDescription: string;
  features: string[];
  disclaimer: string;
  disabledDisclaimer?: string;
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

const SelectPlanButton = ({
  plan,
  onClick,
  contactSupportUrl,
}: {
  plan: {
    id: string;
    requiresContactSupport: boolean;
    trialEnabled: boolean;
    enabled: boolean;
  };
  contactSupportUrl: string | undefined;
  onClick: ButtonProps['onClick'];
}) => {
  const { t } = useTranslation();
  if (plan.requiresContactSupport) {
    return (
      <FullWidthButton
        variant="contained"
        component={RouterLink}
        disabled={!plan.enabled}
        to={contactSupportUrl}
        target="_blank"
      >
        <Caption noWrap textTransform="none">
          {t('plansTable.buttonCaptions.contactSupport')}
        </Caption>
      </FullWidthButton>
    );
  }
  if (plan.trialEnabled) {
    return (
      <FullWidthButton
        variant="contained"
        onClick={onClick}
        disabled={!plan.enabled}
        sx={{
          backgroundColor: theme => theme.palette.highlight.dark,
          color: theme => theme.palette.neutral.main,
          '&:hover': {
            backgroundColor: theme => theme.palette.highlight.dark,
          },
        }}
      >
        <Caption noWrap textTransform="none">
          {t('plansTable.buttonCaptions.startTrial')}
        </Caption>
      </FullWidthButton>
    );
  }
  return (
    <FullWidthButton variant="contained" onClick={onClick} disabled={!plan.enabled}>
      <Caption noWrap textTransform="none">
        {t('plansTable.buttonCaptions.startTrial')}
      </Caption>
    </FullWidthButton>
  );
};

interface PlansTableDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (planName: string) => void;
}

const PlansTableDialog = ({ open, onClose, onSelectPlan }: PlansTableDialogProps) => {
  const { t } = useTranslation();
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const { data, loading } = usePlansTableQuery();
  const plansData = useMemo(
    () => data?.platform.licensing.plans.filter(plan => plan.enabled).sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [data]
  );
  const contactSupportUrl = data?.platform.configuration.locations.contactsupport;

  const [freeTrialDialogOpen, setFreeTrialDialogOpen] = useState<boolean>(false);
  const [getStartedDialogOpen, setGetStartedDialogOpen] = useState<boolean>(false);
  // Keep the first plan clicked here to be used in case in the Confirmation Dialog there is no planId
  const [planSelected, setPlanSelected] = useState<string>();

  useEffect(() => {
    // Close any confirmation dialog if the main dialog is closed
    if (!open && freeTrialDialogOpen) {
      setFreeTrialDialogOpen(false);
    }
    if (!open && getStartedDialogOpen) {
      setGetStartedDialogOpen(false);
    }
  }, [open]);

  const planTranslations: Record<string, PlanTranslation> = t('plansTable.plans', { returnObjects: true }).reduce(
    (acc, plan: PlanTranslation) => ({ ...acc, [plan.name]: plan }),
    {}
  );

  const handlePlanClick = (planSelectedId: string) => {
    setPlanSelected(planSelectedId);
    switch (planSelectedId) {
      case 'FREE': {
        setFreeTrialDialogOpen(true);
        break;
      }
      case 'PLUS': {
        setGetStartedDialogOpen(true);
        break;
      }
      case 'PREMIUM': {
        setGetStartedDialogOpen(true);
        break;
      }
      case 'ENTERPRISE': {
        setGetStartedDialogOpen(true);
        break;
      }
    }
  };

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose} columns={isSmall ? 6 : 12} fullScreen={isMobile}>
        <DialogHeader onClose={onClose}>{t('plansTable.title')}</DialogHeader>
        <Gutters>
          <Caption>{t('plansTable.subtitle')}</Caption>
          <GridContainer sameHeight disablePadding noGap>
            {loading && <Loading text={t('common.loading')} />}
            {plansData.map(plan => {
              const planTranslation = planTranslations[plan.name] ?? {};
              return (
                <GridItem key={plan.id} columns={isSmall ? 6 : 3}>
                  <Box
                    borderRight={isSmall ? 'none' : lines}
                    sx={{
                      '&:last-child': { borderRight: 'none' },
                      '&:first-child': { marginLeft: isSmall ? undefined : gutters(1.5) },
                    }}
                    marginY={isSmall ? gutters(1) : undefined}
                  >
                    <Box
                      borderBottom={isSmall ? undefined : lines}
                      textAlign="center"
                      paddingBottom={gutters()}
                      paddingX={gutters()}
                    >
                      <PlanName>{planTranslation.displayName}</PlanName>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={gutters(0.5)}
                        height={gutters(4)}
                      >
                        {plan.pricePerMonth === 0 ? (
                          <>
                            {/* Free Plan */}
                            <Price>{plan.pricePerMonth}</Price>
                            <Caption color={theme => theme.palette.neutral.light}>
                              {t('plansTable.pricingPeriods.lifetime')}
                            </Caption>
                          </>
                        ) : !plan.pricePerMonth ? (
                          /* Enterprise Plan */
                          <Caption color={theme => theme.palette.neutral.light}>
                            {t('plansTable.pricingPeriods.custom')}
                          </Caption>
                        ) : (
                          <>
                            {/* Rest of the plans */}
                            <Price>{plan.pricePerMonth}</Price>
                            <Caption color={theme => theme.palette.neutral.light}>
                              {t('plansTable.pricingPeriods.monthly')}
                            </Caption>
                          </>
                        )}
                      </Box>
                      <Text textAlign="center" height={gutters(4)} color={theme => theme.palette.primary.main}>
                        {planTranslation.priceDescription}
                      </Text>
                      <SelectPlanButton
                        plan={plan}
                        contactSupportUrl={contactSupportUrl}
                        onClick={() => handlePlanClick(plan.id)}
                      />
                    </Box>
                    <Box
                      borderBottom={isSmall ? lines : undefined}
                      paddingX={gutters()}
                      color={theme => theme.palette.primary.main}
                    >
                      <ul>
                        {planTranslation.features.map((feature, index) => (
                          <li>
                            <Text key={index}>{feature}</Text>
                          </li>
                        ))}
                      </ul>
                      {plan.enabled && <Caption marginBottom={gutters()}>{planTranslation.disclaimer}</Caption>}
                      {!plan.enabled && (
                        <Caption marginBottom={gutters()}>{planTranslation.disabledDisclaimer}</Caption>
                      )}
                    </Box>
                  </Box>
                </GridItem>
              );
            })}
          </GridContainer>
          <Box textAlign="center">
            <CaptionSmall component={RouterLink} to={t('plansTable.seeMoreUrl')}>
              {t('plansTable.seeMore')}
            </CaptionSmall>
          </Box>
        </Gutters>
      </DialogWithGrid>
      <Dialog open={freeTrialDialogOpen}>
        <DialogHeader onClose={() => setFreeTrialDialogOpen(false)}>
          {t('plansTable.confirmationDialogs.freeTrial.title')}
        </DialogHeader>
        <DialogContent>
          <WrapperMarkdown>{t('plansTable.confirmationDialogs.freeTrial.content')}</WrapperMarkdown>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => onSelectPlan('FREE')}>
            {t('plansTable.confirmationDialogs.freeTrial.buttons.continue')}
          </Button>
          <Button variant="contained" onClick={() => onSelectPlan('PLUS')}>
            {t('plansTable.confirmationDialogs.freeTrial.buttons.startPlus')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={getStartedDialogOpen}>
        <DialogHeader onClose={() => setGetStartedDialogOpen(false)}>
          {t('plansTable.confirmationDialogs.getStarted.title')}
        </DialogHeader>
        <DialogContent>
          <WrapperMarkdown>{t('plansTable.confirmationDialogs.getStarted.content')}</WrapperMarkdown>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => planSelected && onSelectPlan(planSelected)}>
            {t('plansTable.confirmationDialogs.getStarted.buttons.continue')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlansTableDialog;
