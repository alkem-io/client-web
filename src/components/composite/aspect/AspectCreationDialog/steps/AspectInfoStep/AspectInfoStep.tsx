import React, { FC } from 'react';
import { useHub } from '../../../../../../hooks';
import AspectForm, { AspectFormOutput } from '../../../AspectForm/AspectForm';
import { AspectCreationType } from '../../AspectCreationDialog';

export interface AspectInfoStepProps {
  aspect?: AspectCreationType;
  aspectNames?: string[];
  onChange: (aspect: AspectFormOutput) => void;
  onStatusChanged: (isValid: boolean) => void;
}

const AspectInfoStep: FC<AspectInfoStepProps> = ({ aspect, aspectNames, onChange, onStatusChanged }) => {
  const { template } = useHub();
  const description = template.aspectTemplates.find(x => x.type === aspect?.type)?.description;

  return (
    <AspectForm
      aspect={aspect}
      aspectNames={aspectNames}
      onChange={onChange}
      onStatusChanged={onStatusChanged}
      descriptionTemplate={description}
    />
  );
};
export default AspectInfoStep;
