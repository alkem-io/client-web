import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import { CreateProfileInput } from '../../../../../core/apollo/generated/graphql-schema';
import FormRows from '../../../../shared/components/FormRows';
import TemplateForm from '../TemplateForm';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlow';
import { LONG_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import InnovationFlowDragNDropEditor from '../../../../collaboration/InnovationFlow/InnovationFlowDragNDropEditor/InnovationFlowDragNDropEditor';

const MAX_NUMBER_OF_STATES = 100;
const MAX_LENGTH_STATE_DISPLAY_NAME = SMALL_TEXT_LENGTH;
const MAX_LENGTH_STATE_DESCRIPTION = LONG_TEXT_LENGTH;

export interface InnovationTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  states: InnovationFlowState[];
}

export interface InnovationTemplateFormSubmittedValues {
  states: InnovationFlowState[];
  profile: CreateProfileInput;
}

interface InnovationFlowTemplateFormProps {
  initialValues: Partial<InnovationTemplateFormValues>;
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<InnovationTemplateFormValues>) => ReactNode);
}

const validator = {
  states: yup
    .array()
    .of(
      yup
        .object()
        .shape({
          displayName: yup.string().required().max(MAX_LENGTH_STATE_DISPLAY_NAME),
          description: yup.string().required().max(MAX_LENGTH_STATE_DESCRIPTION),
        })
        .required()
    )
    .min(1)
    .max(MAX_NUMBER_OF_STATES),
};

const InnovationFlowTemplateForm = ({ initialValues, onSubmit, actions }: InnovationFlowTemplateFormProps) => {
  const onCreateState = (
    currentStates: InnovationFlowState[],
    newState: InnovationFlowState,
    options: { after: string; last: false } | { after?: never; last: true },
    setStates: (value: InnovationFlowState[]) => void
  ) => {
    let newStates: InnovationFlowState[];

    if (options.last) {
      newStates = [...currentStates, newState];
    } else {
      const index = currentStates.findIndex(state => state.displayName === options.after);
      if (index !== -1) {
        newStates = [...currentStates.slice(0, index + 1), newState, ...currentStates.slice(index + 1)];
      } else {
        throw new Error(`State with displayName "${options.after}" not found`);
      }
    }

    setStates(newStates);
  };

  const onEditState = (
    currentStates: InnovationFlowState[],
    editedState: InnovationFlowState,
    newState: InnovationFlowState,
    setStates: (value: InnovationFlowState[]) => void
  ) => {
    const index = currentStates.findIndex(state => state.displayName === editedState.displayName);
    if (index !== -1) {
      const newStates = [...currentStates];
      newStates[index] = newState;
      setStates(newStates);
    } else {
      throw new Error(`State with displayName "${editedState}" not found`);
    }
  };

  const onDeleteState = (
    currentStates: InnovationFlowState[],
    stateToDelete: string,
    setStates: (value: InnovationFlowState[]) => void
  ) => {
    const index = currentStates.findIndex(state => state.displayName === stateToDelete);
    if (index !== -1) {
      const newStates = [...currentStates.slice(0, index), ...currentStates.slice(index + 1)];
      setStates(newStates);
    } else {
      throw new Error(`State with displayName "${stateToDelete}" not found`);
    }
  };

  const onSortStates = (
    currentStates: InnovationFlowState[],
    stateMoved: string,
    sortOrder: number,
    setStates: (value: InnovationFlowState[]) => void
  ) => {
    const movedState = currentStates.find(state => state.displayName === stateMoved);
    if (!movedState) {
      throw new Error('Moved state not found.');
    }
    const statesWithoutMovedState = currentStates.filter(state => state.displayName !== stateMoved);

    // Insert the flowState at the new position
    const newStates = [
      ...statesWithoutMovedState.slice(0, sortOrder),
      movedState,
      ...statesWithoutMovedState.slice(sortOrder),
    ];
    setStates(newStates);
  };

  return (
    <TemplateForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
      verticalLayout
    >
      {({ values, setFieldValue, setFieldTouched }) => {
        const setStates = (states: InnovationFlowState[]) => {
          setFieldTouched('states', true);
          setFieldValue('states', states);
        };

        return (
          <FormRows>
            <InnovationFlowDragNDropEditor
              innovationFlowStates={values.states}
              onCreateFlowState={(newState, options) => onCreateState(values.states, newState, options, setStates)}
              onEditFlowState={(oldState, newState) => onEditState(values.states, oldState, newState, setStates)}
              onDeleteFlowState={stateName => onDeleteState(values.states, stateName, setStates)}
              onUpdateCurrentState={() => {}}
              onUpdateFlowStateOrder={(states, sortOrder) => onSortStates(values.states, states, sortOrder, setStates)}
              currentState={undefined}
            />
          </FormRows>
        );
      }}
    </TemplateForm>
  );
};

export default InnovationFlowTemplateForm;
