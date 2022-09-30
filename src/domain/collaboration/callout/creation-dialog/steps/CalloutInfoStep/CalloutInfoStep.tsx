import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import CalloutForm, { CalloutFormOutput } from '../../../CalloutForm';
import { StepComponentProps } from '../../../../../shared/components/Steps/step/Step';
import { OneStepCreationLayout } from '../../step-layout/StepLayout';
import { CalloutStepProps } from '../CalloutStepProps';

export interface CalloutInfoStepProps extends CalloutStepProps {
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  onSaveAsDraft: () => Promise<void>;
  isCreating: boolean;
}

const CalloutInfoStep: FC<StepComponentProps & CalloutInfoStepProps> = ({
  callout,
  onChange,
  onClose,
  onStatusChanged,
  isValid,
  onSaveAsDraft,
  isCreating,
}) => {
  const { t } = useTranslation();

  // TO BE used once we add the option to select template when creating Callouts
  // const TemplateStepComponent = useMemo<ComponentType<CalloutTemplateStepProps> | null>(() => {
  //   if (callout?.type === CalloutType.Card) {
  //     return CalloutAspectTemplateStep;
  //   } else if (callout?.type === CalloutType.Canvas) {
  //     return CalloutCanvasTemplateStep;
  //   } else {
  //     return null;
  //   }
  // }, [callout]);

  return (
    <OneStepCreationLayout
      dialogTitle={t('components.callout-creation.title')}
      onClose={onClose}
      isValid={isValid}
      isCreating={isCreating}
      onSaveAsDraft={onSaveAsDraft}
    >
      <Box paddingY={theme => theme.spacing(2)}>
        <CalloutForm callout={callout} onChange={onChange} onStatusChanged={onStatusChanged} />
      </Box>
    </OneStepCreationLayout>
  );
};
CalloutInfoStep.displayName = 'CalloutInfoStep';

export default CalloutInfoStep;
