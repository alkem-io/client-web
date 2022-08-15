import React, { ComponentType } from 'react';

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

export interface StepProps<PassedProps extends {}> {
  title: React.ReactNode;
  component: ComponentType<StepComponentProps & PassedProps>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Step = <PassedProps extends {}>(props: StepProps<PassedProps> & PassedProps) => null;

export default Step;
