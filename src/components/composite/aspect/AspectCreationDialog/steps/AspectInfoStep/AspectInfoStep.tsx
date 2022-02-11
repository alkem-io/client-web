import React, { FC } from 'react';
import { useEcoverse } from '../../../../../../hooks';
import AspectForm, { AspectFormOutput } from '../../../AspectForm/AspectForm';
import { AspectCreationType } from '../../AspectCreationDialog';

export interface AspectInfoStepProps {
  aspect?: AspectCreationType;
  aspects: string[];
  onChange: (aspect: AspectFormOutput) => void;
  onStatusChanged: (isValid: boolean) => void;
}

const AspectInfoStep: FC<AspectInfoStepProps> = ({ aspect, aspects, onChange, onStatusChanged }) => {
  const { template } = useEcoverse();
  const description = template.aspectTemplates.find(x => x.type === aspect?.type)?.description;

  return (
    <AspectForm
      aspect={aspect}
      aspects={aspects}
      onChange={onChange}
      onStatusChanged={onStatusChanged}
      templateDescription={description}
    />
  );
};
export default AspectInfoStep;
