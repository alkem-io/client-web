import React, { FC } from 'react';
import AspectForm, { AspectFormOutput } from '../../../AspectForm/AspectForm';
import { AspectCreationType } from '../../AspectCreationDialog';

export interface AspectInfoStepProps {
  aspect?: AspectCreationType;
  onChange: (aspect: AspectFormOutput) => void;
  onStatusChanged: (isValid: boolean) => void;
}

const AspectInfoStep: FC<AspectInfoStepProps> = ({ aspect, onChange, onStatusChanged }) => {
  return <AspectForm aspect={aspect} onChange={onChange} onStatusChanged={onStatusChanged} />;
};
export default AspectInfoStep;
