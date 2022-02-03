import React, { FC } from 'react';
import { Aspect } from '../../../../../../models/graphql-schema';
import AspectForm from '../../../AspectForm/AspectForm';

export type AspectFormOutput = Pick<Aspect, 'displayName' | 'nameID' | 'description' | 'tagset' | 'references'>;
export type AspectFormInput = AspectFormOutput;
export interface AspectInfoStepProps {
  aspect?: AspectFormInput;
  onChange: (aspect: AspectFormOutput) => void;
  onStatusChanged: (isValid: boolean) => void;
}

const AspectInfoStep: FC<AspectInfoStepProps> = ({ aspect, onChange, onStatusChanged }) => {
  return <AspectForm mode={'new'} aspect={aspect} onChange={onChange} onStatusChanged={onStatusChanged} />;
};
export default AspectInfoStep;
