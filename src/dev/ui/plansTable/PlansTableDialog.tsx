import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog, DialogActions, DialogContent, Theme } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption, CaptionSmall, Text } from '@/core/ui/typography';
import GridContainer from '@/core/ui/grid/GridContainer';
import GridItem from '@/core/ui/grid/GridItem';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import Gutters from '@/core/ui/grid/Gutters';
import { usePlansTableQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import SelectPlanButton from './SelectPlanButton';
import { usePlanAvailability } from '@/domain/space/components/CreateSpace/hooks/spacePlans/usePlanAvailability';
import { TagCategoryValues, error } from '@/core/logging/sentry/log';
import { getPlanTranslations } from '@/domain/license/plans/utils/getPlanTranslations';
import { PlanFeatures, PlanName, PlanPrice } from '@/domain/license/plans/ui/PlanCardsComponents';
import {
  LicensingCredentialBasedCredentialType,
  LicensingCredentialBasedPlanType,
} from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';

const lines = (theme: Theme) => `1px solid ${theme.palette.divider}`;

interface PlansTableDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (planName: string) => void;
}

/**
 * Not used, but keeping it for reference
 */
const PlansTableDialog = ({ open, onClose, onSelectPlan }: PlansTableDialogProps) => {
  const { t } = useTranslation();
  const { isSmallScreen, isMediumSmallScreen } = useScreenSize();

  const { data, loading } = usePlansTableQuery({
    skip: !open,
  });

  const { isPlanAvailable } = usePlanAvailability({ skip: !open });

  const planTranslations = getPlanTranslations(t);

  const plansData = useMemo(
    () =>
      (
        data?.platform.licensingFramework.plans
          .filter(plan => plan.enabled)
          .filter(plan => plan.type === LicensingCredentialBasedPlanType.SpacePlan)
          .sort((a, b) => a.sortOrder - b.sortOrder) ?? []
      ).map(plan => ({
        ...plan,
        displayName: planTranslations[plan.name]?.displayName,
        available: isPlanAvailable(plan),
      })),
    [data, planTranslations, isPlanAvailable]
  );

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

  const handlePlanClick = ({ name, isFree }: { name: string; isFree: boolean }) => {
    setPlanSelected(name);
    if (isFree) {
      setFreeTrialDialogOpen(true);
    } else {
      setGetStartedDialogOpen(true);
    }
  };

  const handleSelectPlan = (planName: string) => {
    const planId = plansData.find(plan => plan.name === planName)?.id;
    if (planId) {
      setFreeTrialDialogOpen(false);
      setGetStartedDialogOpen(false);
      onSelectPlan(planId);
    } else {
      error(`Plan with name ${planName} not found in plansData.`, {
        category: TagCategoryValues.UI,
        label: 'PlansTableDialog',
      });
    }
  };

  return (
    <>
      <DialogWithGrid
        open={open}
        onClose={onClose}
        columns={isMediumSmallScreen ? 6 : 12}
        fullScreen={isSmallScreen}
        aria-labelledby="plans-table-dialog-title"
      >
        <DialogHeader onClose={onClose} id="plans-table-dialog-title">
          {t('plansTable.title')}
        </DialogHeader>
        <Gutters>
          <GridContainer sameHeight disablePadding disableGap>
            {loading && <Loading text={t('common.loading')} />}
            {plansData.map(plan => {
              const planTranslation = planTranslations[plan.name] ?? {};
              return (
                <GridItem key={plan.id} columns={isMediumSmallScreen ? 6 : 3}>
                  <Box
                    borderRight={isMediumSmallScreen ? 'none' : lines}
                    sx={{
                      '&:last-of-type': { borderRight: 'none' },
                      '&:first-of-type': { marginLeft: isMediumSmallScreen ? undefined : gutters(1.5) },
                    }}
                    marginY={isMediumSmallScreen ? gutters(1) : undefined}
                  >
                    <Box
                      borderBottom={isMediumSmallScreen ? undefined : lines}
                      textAlign="center"
                      paddingBottom={gutters()}
                      paddingX={gutters()}
                    >
                      <PlanName>{planTranslation.displayName}</PlanName>
                      <PlanPrice plan={plan} />
                      <Text textAlign="center" height={gutters(4)} sx={{ color: theme => theme.palette.primary.main }}>
                        {planTranslation.priceDescription}
                      </Text>
                      <SelectPlanButton plan={plan} onClick={() => handlePlanClick(plan)} />
                    </Box>
                    <Box
                      borderBottom={isMediumSmallScreen ? lines : undefined}
                      paddingX={gutters()}
                      sx={{ color: theme => theme.palette.primary.main }}
                    >
                      <PlanFeatures
                        planTranslation={planTranslation}
                        sx={
                          isMediumSmallScreen
                            ? { marginX: 'auto', width: '60%' }
                            : { marginTop: gutters(), marginLeft: gutters(2) }
                        }
                      />
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
          <Button
            variant="text"
            onClick={() => handleSelectPlan(LicensingCredentialBasedCredentialType.SpaceLicenseFree)}
          >
            {t('plansTable.confirmationDialogs.freeTrial.buttons.continue')}
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSelectPlan(LicensingCredentialBasedCredentialType.SpaceLicensePlus)}
          >
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
          <Button variant="contained" onClick={() => planSelected && handleSelectPlan(planSelected)}>
            {t('plansTable.confirmationDialogs.getStarted.buttons.continue')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlansTableDialog;
