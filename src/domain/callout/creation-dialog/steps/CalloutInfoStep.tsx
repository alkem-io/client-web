import React, { FC } from 'react';
import CalloutForm, { CalloutFormOutput } from '../../../../components/composite/aspect/AspectCreationDialog/form/CalloutForm';
import { CalloutCreationType } from '../CalloutCreationDialog';
export interface CalloutInfoStepProps {
  callout: CalloutCreationType;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
}

const CalloutInfoStep: FC<CalloutInfoStepProps> = ({ callout, onChange, onStatusChanged }) => {
  return (
    <CalloutForm
      callout={callout}
      onChange={onChange}
      onStatusChanged={onStatusChanged}
    />
  );
};
export default CalloutInfoStep;
