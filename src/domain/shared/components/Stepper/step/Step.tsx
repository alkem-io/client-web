import React, { ComponentType, FC } from 'react';

export interface StepDefinition {
  title: React.ReactNode;
  name: string;
}

export interface StepComponentProps {
  activeStep: string;
  definitions: StepDefinition[];
  next?: () => void;
  prev?: () => void;
}

export interface StepProps {
  title: React.ReactNode;
  component: ComponentType<StepComponentProps>;
}

const Step: FC<StepProps> = ({}) => {
  return null;
};
export default Step;