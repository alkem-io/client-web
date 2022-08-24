import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import { Box, Button, DialogActions, Step } from '@mui/material';
import StepLabel from '@mui/material/StepLabel';
import { DialogContent, DialogTitle } from '../../../core/dialog';
import AspectTypeStep from './steps/AspectTypeStep/AspectTypeStep';
import AspectReviewStep from './steps/AspectReviewStep/AspectReviewStep';
import { AspectFormOutput } from '../AspectForm/AspectForm';
import AspectInfoStep from './steps/AspectInfoStep/AspectInfoStep';
import { CreateAspectOnCalloutInput } from '../../../../models/graphql-schema';
import HelpButton from '../../../core/HelpButton';
import AspectVisualsStep, { AspectVisualsStepProps } from './steps/AspectVisualsStep/AspectVisualsStep';

export type AspectCreationType = Partial<CreateAspectOnCalloutInput>;
export type AspectCreationOutput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

enum DialogStep {
  Type,
  Details,
  Create,
  Visuals,
}

interface StepDefinition {
  label: string;
  isInvalid?: () => boolean;
}

export interface AspectCreationDialogProps extends Omit<AspectVisualsStepProps, 'aspectNameId'> {
  open: boolean;
  aspectNames: string[];
  onClose: () => void;
  onCreate: (aspect: AspectCreationOutput) => Promise<{ nameID: string } | undefined>;
}

const AspectCreationDialog: FC<AspectCreationDialogProps> = ({
  open,
  aspectNames,
  onClose,
  onCreate,
  ...visualsStepProps
}) => {
  const { t } = useTranslation();

  const [activeStepIndex, setActiveStepIndex] = useState(DialogStep.Type);
  const [aspect, setAspect] = useState<AspectCreationType>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [aspectNameId, setAspectNameId] = useState<string>();

  const getNextStepIndex = (index: number) => {
    if (index >= steps.length - 1) {
      throw new Error('Last step cannot have a next step.');
    }

    return index + 1;
  };

  const getPrevStepIndex = (index: number) => {
    if (index <= 0) {
      throw new Error('First step cannot have a previous step.');
    }

    return index - 1;
  };

  const getStep = (index: number) => {
    const step = steps[index];

    if (!step) {
      throw new Error(`Unable to find step number ${index}.`);
    }

    return step;
  };

  const handleNext = () => {
    setActiveStepIndex(prevActiveStepIndex => getNextStepIndex(prevActiveStepIndex));
  };

  const handleBack = () => {
    setActiveStepIndex(prevActiveStepIndex => getPrevStepIndex(prevActiveStepIndex));
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setActiveStepIndex(DialogStep.Type);
    setAspect({});
    setAspectNameId(undefined);
  };

  const handleCreate = async () => {
    handleNext();
    const created = await onCreate({
      displayName: aspect?.displayName ?? '',
      description: aspect?.description ?? '',
      type: aspect?.type ?? '',
      tags: aspect?.tags ?? [],
    });
    setAspectNameId(created?.nameID);
  };

  const handleTypeChange = (type: string) => setAspect({ ...aspect, type });
  const handleFormChange = (newAspect: AspectFormOutput) => setAspect({ ...aspect, ...newAspect });
  const handleFormStatusChange = (isValid: boolean) => setIsFormValid(isValid);

  const steps: StepDefinition[] = [
    {
      label: t('components.aspect-creation.type-step.title'),
      isInvalid: () => !aspect.type,
    },
    {
      label: t('components.aspect-creation.info-step.title'),
      isInvalid: () => !isFormValid,
    },
    {
      label: t('components.aspect-creation.create-step.title'),
    },
    {
      label: t('components.aspect-creation.visuals-step.title'),
    },
  ];

  const isStepCompleted = (index: number) => index < activeStepIndex;
  const isStepLast = (index: number) => index === steps.length - 1;

  const renderButtons = () => {
    switch (activeStepIndex) {
      case DialogStep.Visuals: {
        return <Button onClick={handleClose}>{t('buttons.close')}</Button>;
      }
      case DialogStep.Create: {
        return (
          <>
            <Button color="inherit" onClick={handleBack}>
              {t('buttons.back')}
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleCreate}>{t('buttons.create')}</Button>
          </>
        );
      }
      default: {
        return (
          <>
            <Button color="inherit" disabled={activeStepIndex === 0} onClick={handleBack}>
              {t('buttons.back')}
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button disabled={getStep(activeStepIndex).isInvalid?.()} onClick={handleNext}>
              {t('buttons.next')}
            </Button>
          </>
        );
      }
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="aspect-creation-title">
      <DialogTitle id="aspect-creation-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          {t('components.aspect-creation.title')}
          <HelpButton helpText={t('components.aspect-creation.type-step.type-help-text')} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStepIndex}>
          {steps.map((x, i) => (
            <Step key={i} last={isStepLast(i)} completed={isStepCompleted(i)}>
              <StepLabel>{x.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box marginBottom={2} marginTop={4}>
          {activeStepIndex === DialogStep.Type && <AspectTypeStep type={aspect?.type} onChange={handleTypeChange} />}
          {activeStepIndex === DialogStep.Details && (
            <AspectInfoStep
              aspect={aspect}
              aspectNames={aspectNames}
              onChange={handleFormChange}
              onStatusChanged={handleFormStatusChange}
            />
          )}
          {activeStepIndex === DialogStep.Create && <AspectReviewStep aspect={aspect} />}
          {activeStepIndex === DialogStep.Visuals && (
            <AspectVisualsStep aspectNameId={aspectNameId} {...visualsStepProps} />
          )}
        </Box>
      </DialogContent>
      <DialogActions>{renderButtons()}</DialogActions>
    </Dialog>
  );
};

export default AspectCreationDialog;
