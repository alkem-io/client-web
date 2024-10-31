import { ReactNode } from 'react';

import * as yup from 'yup';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

import { BlockSectionTitle } from '../../../../core/ui/typography';
import TemplateFormBase, { type TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import InnovationFlowDragNDropEditor from '../../../collaboration/InnovationFlow/InnovationFlowDragNDropEditor/InnovationFlowDragNDropEditor';

import { mapTemplateProfileToUpdateProfile } from './common/mappings';
import { InnovationFlowTemplate } from '../../models/InnovationFlowTemplate';
import { MAX_INNOVATION_FLOW_STATES } from '../../models/CollaborationTemplate';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { type InnovationFlowState } from '../../../collaboration/InnovationFlow/InnovationFlow';

const validator = {
  innovationFlow: yup.object().shape({
    states: yup
      .array()
      .required()
      .of(
        yup
          .object()
          .shape({
            displayName: yup.string().required(),
            description: yup.string().max(MARKDOWN_TEXT_LENGTH),
          })
          .required()
      )
      .min(1)
      .max(MAX_INNOVATION_FLOW_STATES),
  }),
};

const InnovationFlowTemplateForm = ({ actions, template, onSubmit }: InnovationFlowTemplateFormProps) => {
  const { t } = useTranslation();

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

  const initialValues: InnovationFlowTemplateFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfile(template?.profile),
    innovationFlow: { states: template?.innovationFlow?.states ?? [] },
  };

  return (
    <TemplateFormBase
      actions={actions}
      template={template}
      validator={validator}
      initialValues={initialValues}
      templateType={TemplateType.InnovationFlow}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setFieldTouched }) => {
        const setStates = (states: InnovationFlowState[]) => {
          setFieldTouched('innovationFlow.states', true);
          setFieldValue('innovationFlow.states', states);
        };

        return (
          <>
            <BlockSectionTitle>{t('common.states')}</BlockSectionTitle>

            <InnovationFlowDragNDropEditor
              innovationFlowStates={values.innovationFlow.states}
              onEditFlowState={(oldState, newState) =>
                onEditState(values.innovationFlow.states, oldState, newState, setStates)
              }
              onUpdateFlowStateOrder={(states, sortOrder) =>
                onSortStates(values.innovationFlow.states, states, sortOrder, setStates)
              }
              onCreateFlowState={(newState, options) =>
                onCreateState(values.innovationFlow.states, newState, options, setStates)
              }
              onDeleteFlowState={stateName => onDeleteState(values.innovationFlow.states, stateName, setStates)}
            />
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default InnovationFlowTemplateForm;

export interface InnovationFlowTemplateFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  innovationFlow: {
    states: InnovationFlowState[];
  };
}

interface InnovationFlowTemplateFormProps {
  onSubmit: (values: InnovationFlowTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<InnovationFlowTemplateFormSubmittedValues>) => ReactNode);

  template?: InnovationFlowTemplate;
}
