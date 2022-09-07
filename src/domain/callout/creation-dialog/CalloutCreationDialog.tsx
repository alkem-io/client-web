import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import { CalloutType } from '../../../models/graphql-schema';
import Steps from '../../shared/components/Steps/Steps';
import Step from '../../shared/components/Steps/step/Step';
import { StepLayoutHolder } from './step-layout/StepLayout';
import CalloutInfoStep from './steps/CalloutInfoStep/CalloutInfoStep';
// import CalloutTemplateStep from './steps/CalloutTemplateStep/CalloutTemplateStep';
import CalloutSummaryStep from './steps/CalloutSummaryStep/CalloutSummaryStep';
import { CalloutCreationType } from './useCalloutCreation/useCalloutCreation';

export type CalloutDialogCreationType = {
  description?: string;
  displayName?: string;
  templateId?: string;
  type?: CalloutType;
};

export interface CalloutCreationDialogProps {
  open: boolean;
  isPublishing: boolean;
  onClose: () => void;
  onPublish: (callout: CalloutCreationType) => Promise<void>;
  onSaveAsDraft: (callout: CalloutCreationType) => Promise<void>;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({
  open,
  isPublishing,
  onClose,
  onPublish,
  onSaveAsDraft,
}) => {
  const { t } = useTranslation();

  const [callout, setCallout] = useState<CalloutDialogCreationType>({});
  const [isInfoStepValid, setIsInfoStepValid] = useState(false);
  // const [isTemplateStepValid, setIsTemplateStepValid] = useState(false);

  const handleInfoStepValueChange = useCallback(
    infoStepCallout => {
      setCallout({ ...callout, ...infoStepCallout });
    },
    [callout]
  );
  const handleInfoStepStatusChange = useCallback((isValid: boolean) => setIsInfoStepValid(isValid), []);
  /*const handleTemplateStepValueChange = useCallback(
    (templateId: string) => {
      setCallout({ ...callout, templateId });
      setIsTemplateStepValid(true);
    },
    [callout]
  );*/
  const handleSummaryStepPublish = useCallback(() => {
    const newCallout = {
      displayName: callout.displayName!,
      description: callout.description!,
      templateId: callout.templateId!,
      type: callout.type!,
    };

    setCallout({});

    return onPublish(newCallout);
  }, [callout, onPublish]);
  const handleSummarySaveAsDraft = useCallback(() => {
    const newCallout = {
      displayName: callout.displayName!,
      description: callout.description!,
      templateId: callout.templateId!,
      type: callout.type!,
    };

    setCallout({});

    return onSaveAsDraft(newCallout);
  }, [callout, onSaveAsDraft]);
  const handleClose = useCallback(() => {
    setCallout({});
    onClose?.();
  }, [onClose]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
      <StepLayoutHolder>
        <Steps>
          <Step
            component={CalloutInfoStep}
            title={t('components.callout-creation.info-step.title')}
            callout={callout}
            onClose={handleClose}
            isValid={isInfoStepValid}
            onChange={handleInfoStepValueChange}
            onStatusChanged={handleInfoStepStatusChange}
          />
          {/*
          this needs to be added after templates are introduced to the callouts on the server
          <Step
            component={CalloutTemplateStep}
            title={t('components.callout-creation.template-step.title')}
            callout={callout}
            onClose={handleClose}
            isValid={isTemplateStepValid}
            onChange={handleTemplateStepValueChange}
          />*/}
          <Step
            component={CalloutSummaryStep}
            title={t('components.callout-creation.create-step.title')}
            callout={callout}
            onClose={handleClose}
            onPublish={handleSummaryStepPublish}
            onSaveAsDraft={handleSummarySaveAsDraft}
            isPublishing={isPublishing}
          />
        </Steps>
      </StepLayoutHolder>
    </Dialog>
  );
};

export default CalloutCreationDialog;
