import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Step, StepLabel, Stepper, Button } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import createLayoutHolder from '../../../shared/layout/LayoutHolder';
import { StepDefinition } from '../../../shared/components/Steps/step/Step';
import { LoadingButton } from '@mui/lab';

interface StepLayoutProps {
  dialogTitle: string;
  next?: () => void;
  prev?: () => void;
  isValid?: boolean;
  onClose?: () => void;
  steps: StepDefinition[];
  activeStep: string;
}

const StepLayoutImpl: FC<StepLayoutProps> = ({
  activeStep,
  steps,
  children,
  dialogTitle,
  onClose,
  isValid = true,
  next,
  prev,
}) => {
  const { t } = useTranslation();
  // For now, using just the active step position to determine whether the previous steps are completed.
  // It's possible to base the state of the Steps on whether a step was "really" completed (e.g. the form was filled),
  // in this case StepLayoutImpl needs to receive something like completedSteps: { [stepName: string]: boolean }
  const activeStepIndex = useMemo(() => steps.findIndex(stepDef => stepDef.name === activeStep), [steps, activeStep]);

  return (
    <Box>
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        <Box display="flex" justifyContent="space-between">
          {dialogTitle}
          <Stepper activeStep={activeStepIndex} sx={{ width: '50%' }}>
            {steps.map((stepDef, stepIndex) => {
              return (
                <Step key={stepDef.name} completed={stepIndex < activeStepIndex} last={stepIndex === steps.length - 1}>
                  <StepLabel>{stepDef.title}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {prev && (
          <Button onClick={prev} variant="outlined">
            {t('buttons.back')}
          </Button>
        )}
        {next && (
          <Button onClick={next} disabled={!isValid} variant="contained">
            {t('buttons.next')}
          </Button>
        )}
      </DialogActions>
    </Box>
  );
};

interface StepSummaryLayoutProps {
  dialogTitle: string;
  isPublishing: boolean;
  prev?: () => void;
  onPublish?: () => Promise<void>;
  onSaveAsDraft?: () => Promise<void>;
  onClose?: () => void;
}

export const StepSummaryLayoutImpl: FC<StepSummaryLayoutProps> = ({
  children,
  dialogTitle,
  onClose,
  isPublishing,
  prev,
  onPublish,
  onSaveAsDraft,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <DialogTitle id="callout-summary-title" onClose={onClose}>
        {dialogTitle}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {prev && (
          <Button disabled={isPublishing} onClick={prev} variant="outlined">
            {t('buttons.back')}
          </Button>
        )}
        {onSaveAsDraft && (
          <LoadingButton
            loading={isPublishing}
            loadingPosition="start"
            loadingIndicator={`${t('buttons.save-draft')}...`}
            onClick={onSaveAsDraft}
            variant="contained"
          >
            {t('buttons.save-draft')}
          </LoadingButton>
        )}
        {onPublish && (
          <LoadingButton
            loading={isPublishing}
            loadingPosition="start"
            loadingIndicator={`${t('buttons.publish')}...`}
            onClick={onPublish}
            variant="contained"
          >
            {t('buttons.publish')}
          </LoadingButton>
        )}
      </DialogActions>
    </Box>
  );
};

export const { LayoutHolder: StepLayoutHolder, createLayout } = createLayoutHolder();

export const StepLayout = createLayout(StepLayoutImpl);
export const StepSummaryLayout = createLayout(StepSummaryLayoutImpl);
