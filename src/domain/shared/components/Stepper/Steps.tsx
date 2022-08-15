import React, { FC, useMemo, useState } from 'react';
import { StepDefinition, StepProps } from './step/Step';

export interface StepsProps {
  initialActiveStep?: string;
  children: React.ReactElement<StepProps> | React.ReactElement<StepProps>[];
}

const Steps: FC<StepsProps> = ({ initialActiveStep, children: childrenOrChild }) => {
  const children = Array.isArray(childrenOrChild) ? childrenOrChild : [childrenOrChild];

  if (children.some(x => !x.props.component.displayName)) {
    throw new Error('Unable to compute initial step: A step does not have a displayName!');
  }

  const initialStep = initialActiveStep ?? children[0].props.component.displayName;

  const [activeStep, setActiveStep] = useState(initialStep);

  const definitions = useMemo<StepDefinition[]>(() => children.map(x => ({
    title: x.props.title,
    name: x.props.component.displayName!,
  })), [children]);

  const currentStep = children.find(x => x.props.component.displayName === activeStep);

  if (!currentStep) {
    throw new Error(`Step with displayName ${activeStep} not found!`);
  }

  const findActiveStepIndex = () => children.findIndex(x => x.props.component.displayName === activeStep);

  const prev = useMemo(() => {
    const index = findActiveStepIndex();

    if (index === 0) {
      return undefined;
    }

    return () => setActiveStep(children[index - 1]!.props.component.displayName!)
  }, [activeStep]);

  const next = useMemo(() => {
    const index = findActiveStepIndex();

    if (index === children.length - 1) {
      return undefined;
    }

    return () => setActiveStep(children[index + 1]!.props.component.displayName!);
  }, [activeStep]);

  const Component = currentStep.props.component;

  return <Component activeStep={activeStep} definitions={definitions} prev={prev} next={next} />;
};
export default Steps;
