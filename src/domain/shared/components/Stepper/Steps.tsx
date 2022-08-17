import React, { useMemo, useState } from 'react';
import { StepDefinition, StepProps } from './step/Step';

export interface StepsProps<PassedProps extends {}> {
  initialActiveStep?: string;
  children: React.ReactElement<StepProps<PassedProps>> | React.ReactElement<StepProps<PassedProps>>[];
}

const Steps = <PassedProps extends {}>({ initialActiveStep, children: childrenOrChild }: StepsProps<PassedProps>) => {
  const children = Array.isArray(childrenOrChild) ? childrenOrChild : [childrenOrChild];

  if (children.some(x => !x.props.component.displayName)) {
    throw new Error('All steps must have a displayName.');
  }

  const initialStep = initialActiveStep ?? children[0].props.component.displayName!;

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

  // Taking whatever props we make use of here from a <Step>, passing the rest to the step Component
  const { component: Component, title, ...passedProps } = currentStep.props;

  return <Component activeStep={activeStep} steps={definitions} prev={prev} next={next} {...passedProps as PassedProps} />;
};

export default Steps;
