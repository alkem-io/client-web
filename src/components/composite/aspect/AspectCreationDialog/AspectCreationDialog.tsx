import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import { Box, Button, Step } from '@mui/material';
import StepLabel from '@mui/material/StepLabel';
import { DialogActions, DialogContent, DialogTitle } from '../../../core/dialog';
import AspectTypeStep from './steps/AspectTypeStep/AspectTypeStep';
import AspectReviewStep from './steps/AspectReviewStep/AspectReviewStep';
import { AspectFormOutput } from '../AspectForm/AspectForm';
import AspectInfoStep from './steps/AspectInfoStep/AspectInfoStep';
import { CreateAspectOnContextInput } from '../../../../models/graphql-schema';
import HelpButton from '../../../core/HelpButton';

export type AspectCreationType = Partial<CreateAspectOnContextInput>;
export type AspectCreationOutput = Omit<CreateAspectOnContextInput, 'contextID'>;

interface IStep {
  /** identifier  */
  index: number;
  /** text label */
  label: string;
  /** is it already completed */
  isCompleted: boolean;
  /** is ir valid to complete */
  isInvalid?: boolean;
  /** is this the first step */
  isFirst?: boolean;
  /** is this the last step */
  isFinal?: boolean;
}

export interface AspectCreationDialogProps {
  open: boolean;
  aspectNames: string[];
  onCancel: () => void;
  onCreate: (aspect: AspectCreationOutput) => void;
}

const AspectCreationDialog: FC<AspectCreationDialogProps> = ({ open, aspectNames, onCancel, onCreate }) => {
  const { t } = useTranslation();

  const [completedSteps, setCompletedStep] = useState(new Set<number>());
  const [aspect, setAspect] = useState<AspectCreationType>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const getNextStep = (step: IStep) => {
    if (getStep(step).isFinal) {
      throw new Error('Unable to find next step for the Final step');
    }

    const newStep = steps.find(x => x.index === step.index + 1);

    if (!newStep) {
      throw new Error(`Unable to find next step for stepId ${step.index}`);
    }

    return newStep;
  };
  const getPrevStep = (step: IStep) => {
    if (getStep(step).isFirst) {
      throw new Error('Unable to find prev step for the First step');
    }

    const newStep = steps.find(x => x.index === step.index - 1);

    if (!newStep) {
      throw new Error(`Unable to find prev step for stepId ${step.index}`);
    }

    return newStep;
  };
  const getStep = (step: IStep) => {
    const stepRef = steps.find(x => x.index === step.index);

    if (!stepRef) {
      throw new Error(`Unable to find step for stepId ${step.index}`);
    }

    return stepRef;
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
    resetState();
    onCancel();
  };

  const resetState = () => {
    setActiveStep(steps[0]);
    setAspect({});
    setCompletedStep(new Set<number>());
  };

  const handleFinish = () => {
    onCreate({
      displayName: aspect?.displayName ?? '',
      description: aspect?.description ?? '',
      type: aspect?.type ?? '',
      tags: aspect?.tags ?? [],
    });
    resetState();
  };
  const handleTypeChange = (type: string) => setAspect({ ...aspect, type });
  const handleFormChange = (newAspect: AspectFormOutput) => setAspect({ ...aspect, ...newAspect });
  const handleFormStatusChange = (isValid: boolean) => setIsFormValid(isValid);

  const _isStepCompleted = (step: number) => completedSteps.has(step);

  const steps: IStep[] = [
    {
      index: 0,
      label: t('components.aspect-creation.type-step.title'),
      isCompleted: _isStepCompleted(0),
      isInvalid: !aspect.type,
      isFirst: true,
    },
    {
      index: 1,
      label: t('components.aspect-creation.info-step.title'),
      isCompleted: _isStepCompleted(1),
      isInvalid: !isFormValid,
    },
    {
      index: 2,
      label: t('components.aspect-creation.final-step.title'),
      isCompleted: _isStepCompleted(2),
      isFinal: true,
    },
  ];
  // todo: how to move this at the beginning
  const [activeStep, setActiveStep] = useState<IStep>(steps[0]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="aspect-creation-title">
      <DialogTitle id="aspect-creation-title" onClose={handleCancel}>
        <Box display="flex" alignItems="center">
          {t('components.aspect-creation.title')}
          <HelpButton helpText={t('components.aspect-creation.type-step.type-help-text')} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep.index}>
          {steps.map((x, i) => (
            <Step key={i} last={getStep(x).isFinal} completed={getStep(x).isCompleted}>
              <StepLabel>{x.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box marginBottom={2} marginTop={4}>
          {activeStep.index === 0 && <AspectTypeStep type={aspect?.type} onChange={handleTypeChange} />}
          {activeStep.index === 1 && (
            <AspectInfoStep
              aspect={aspect}
              aspectNames={aspectNames}
              onChange={handleFormChange}
              onStatusChanged={handleFormStatusChange}
            />
          )}
          {activeStep.index === 2 && <AspectReviewStep aspect={aspect} />}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" disabled={getStep(activeStep).isFirst} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {getStep(activeStep).isFinal ? (
          <Button onClick={handleFinish}>Create</Button>
        ) : (
          <Button disabled={getStep(activeStep).isInvalid} onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default AspectCreationDialog;
