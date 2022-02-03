import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import { Box, Button, Step } from '@mui/material';
import StepLabel from '@mui/material/StepLabel';
import { DialogActions, DialogContent, DialogTitle } from '../../../core/dialog';
import AspectTypeStep from './steps/AspectTypeStep/AspectTypeStep';
import { SectionSpacer } from '../../../core/Section/Section';

interface IStep {
  index: number;
  label: string;
  isCompleted: () => boolean;
  isFirst?: boolean;
  isFinal?: boolean;
}

export interface AspectCreationDialogProps {
  open: boolean;
  onCancel: () => void;
}

const AspectCreationDialog: FC<AspectCreationDialogProps> = ({ open, onCancel }) => {
  const { t } = useTranslation();

  const steps: IStep[] = useMemo(
    () => [
      {
        index: 0,
        label: t('components.aspect-creation.type-step.title'),
        isCompleted: () => _isStepCompleted(0),
        isFirst: true,
      },
      {
        index: 1,
        label: t('components.aspect-creation.info-step.title'),
        isCompleted: () => _isStepCompleted(1),
      },
      {
        index: 2,
        label: t('components.aspect-creation.final-step.title'),
        isCompleted: () => _isStepCompleted(2),
        isFinal: true,
      },
    ],
    [t]
  );

  const [activeStep, setActiveStep] = useState<IStep>(steps[0]);
  const [completedSteps, setCompletedStep] = useState(new Set<number>());
  const [type, setType] = useState<string>();

  const getNextStep = (prevStep: IStep) => {
    if (prevStep.isFinal) {
      throw new Error('Unable to find next step for the Final step');
    }

    const newStep = steps.find(x => x.index === prevStep.index + 1);

    if (!newStep) {
      throw new Error(`Unable to find next step for stepId ${prevStep.index}`);
    }

    return newStep;
  };

  const getPrevStep = (prevStep: IStep) => {
    if (prevStep.isFirst) {
      throw new Error('Unable to find prev step for the First step');
    }

    const newStep = steps.find(x => x.index === prevStep.index - 1);

    if (!newStep) {
      throw new Error(`Unable to find prev step for stepId ${prevStep.index}`);
    }

    return newStep;
  };

  const handleNext = () => {
    setCompletedStep(completedSteps.add(activeStep.index));
    setActiveStep(prevActiveStep => getNextStep(prevActiveStep));
  };

  const handleBack = () => {
    const newActiveStep = getPrevStep(activeStep);
    setActiveStep(newActiveStep);
    // state is not updated
    completedSteps.delete(newActiveStep.index);
    setCompletedStep(completedSteps);
  };

  const handleCancel = () => {
    setActiveStep(steps[0]);
    setCompletedStep(new Set<number>());
    setType(undefined);
    onCancel();
  };

  const handleFinish = () => {};

  const handleTypeChange = (type: string) => setType(type);
  const _isStepCompleted = (step: number) => completedSteps.has(step);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="aspect-creation-title">
      <DialogTitle id="aspect-creation-title" onClose={handleCancel}>
        {t('components.aspect-creation.title')}
      </DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep.index}>
          {steps.map((x, i) => (
            <Step key={i} last={x.isFinal} completed={x.isCompleted()}>
              <StepLabel>{x.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <SectionSpacer double />
        {activeStep.index === 0 && <AspectTypeStep type={type} onChange={handleTypeChange} />}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" disabled={activeStep.isFirst} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep.isFinal ? (
          <Button onClick={handleFinish}>Finish</Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default AspectCreationDialog;
