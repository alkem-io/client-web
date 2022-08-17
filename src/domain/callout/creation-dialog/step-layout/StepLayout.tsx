import React, { FC, useMemo } from 'react';
import { Box, LinearProgress, Step, StepLabel, Stepper } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../components/core/dialog';
import Button from '@mui/material/Button';
import createLayoutHolder from '../../../shared/layout/LayoutHolder';
import { StepDefinition } from '../../../shared/components/Stepper/step/Step';
import { useTranslation } from 'react-i18next';

export interface StepLayoutProps {
  dialogTitle: string;
  next?: () => void;
  prev?: () => void;
  isValid?: boolean;
  onClose: () => void;
  steps: StepDefinition[];
  activeStep: string;
}

export const StepLayoutImpl: FC<StepLayoutProps> = ({ activeStep, steps, children, dialogTitle, onClose, isValid = true, next, prev }) => {
  const { t } = useTranslation();
  // For now, using just the active step position to determine whether the previous steps are completed.
  // It's possible to base the state of the Stepper on whether a step was "really" completed (e.g. the form was filled),
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

export interface StepSummaryLayoutProps {
  onClose: () => void;
}

export const StepSummaryLayoutImpl: FC<StepSummaryLayoutProps> = ({ children, onClose }) => {
  return (
    <Box>
      <DialogTitle id="callout-creation-title" onClose={onClose}>
        Summary
      </DialogTitle>
      <LinearProgress value={100} variant="determinate" />
      Congrats!
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Finish</Button>
      </DialogActions>
    </Box>
  );
};

export const { LayoutHolder: StepLayoutHolder, createLayout } = createLayoutHolder();

export const StepLayout = createLayout(StepLayoutImpl);
export const StepSummaryLayout = createLayout(StepSummaryLayoutImpl);
