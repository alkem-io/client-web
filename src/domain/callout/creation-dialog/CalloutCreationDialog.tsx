import React, { FC, useCallback, useState } from 'react';
import { CalloutType } from '../../../models/graphql-schema';
import Dialog from '@mui/material/Dialog/Dialog';
import Steps from '../../shared/components/Stepper/Steps';
import Step from '../../shared/components/Stepper/step/Step';
import { CalloutStep2, CalloutStep3 } from './steps/CalloutStep1';
import { StepLayoutHolder } from './step-layout/StepLayout';
import CalloutInfoStep from './steps/CalloutInfoStep';
import { useTranslation } from 'react-i18next';
import CalloutTemplateStep from './steps/CalloutTemplateStep/CalloutTemplateStep';

export type CalloutCreationType = {
  description?: string;
  displayName?: string;
  type?: CalloutType;
  templateId?: string;
};

interface CalloutCreationOutput {}

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  // todo return type
  onCreate: (aspect: CalloutCreationOutput) => Promise<{} | undefined>;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  const [callout, setCallout] = useState<CalloutCreationType>({});
  const [isInfoStepValid, setIsInfoStepValid] = useState(false);

  const handleInfoStepValueChange = useCallback(infoStepCallout => {
    setCallout({ ...callout, ...infoStepCallout });
  }, [callout]);
  const handleInfoStepStatusChange = useCallback(isValid => setIsInfoStepValid(isValid), []);
  const handleTemplateStepValueChange = useCallback(templateId => {
    setCallout({ ...callout, templateId })
  }, [callout]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
      <StepLayoutHolder>
        <Steps>
          <Step
            component={CalloutInfoStep}
            title={t('components.callout-creation.info-step.title')}
            isValid={isInfoStepValid}
            callout={callout}
            onChange={handleInfoStepValueChange}
            onStatusChanged={handleInfoStepStatusChange}
          />
          <Step
            component={CalloutTemplateStep}
            title={t('components.callout-creation.template-step.title')}
            callout={callout}
            onChange={handleTemplateStepValueChange}
          />
          <Step
            component={CalloutStep3}
            title={t('components.callout-creation.create-step.title')}
            onClose={onClose}
          />
        </Steps>
      </StepLayoutHolder>
    </Dialog>
  );
};

export default CalloutCreationDialog;
