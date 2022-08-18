import React, { ComponentType, FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StepComponentProps } from '../../../../shared/components/Steps/step/Step';
import { CalloutType } from '../../../../../models/graphql-schema';
import { StepLayoutImpl } from '../../step-layout/StepLayout';
import CalloutAspectTemplateStep from './CalloutAspectTemplateStep';
import CalloutCanvasTemplateStep from './CalloutCanvasTemplateStep';
import { CalloutTemplateStepProps } from './CalloutTemplateStepProps';

const CalloutTemplateStep: FC<StepComponentProps & CalloutTemplateStepProps> = ({ callout, onChange, onClose, activeStep, isValid, steps, next, prev }) => {
  const { t } = useTranslation();

  const TemplateStepComponent = useMemo<ComponentType<CalloutTemplateStepProps> | null>(() => {
    if (callout?.type === CalloutType.Card) {
      return CalloutAspectTemplateStep;
    } else if (callout?.type === CalloutType.Canvas) {
      return CalloutCanvasTemplateStep;
    } else {
      return null;
    }
  }, [callout]);

  return (
    <StepLayoutImpl
      dialogTitle={t('components.callout-creation.title')}
      onClose={onClose}
      next={next} prev={prev}
      activeStep={activeStep}
      steps={steps}
      isValid={isValid}
    >
      {TemplateStepComponent && (
        <TemplateStepComponent
          callout={callout}
          onChange={onChange}
        />
      )}
    </StepLayoutImpl>
  );
};
CalloutTemplateStep.displayName = 'CalloutTemplateStep';

export default CalloutTemplateStep;
