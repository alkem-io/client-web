import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfile } from './common/mappings';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { CollaborationTemplate } from '../../models/CollaborationTemplate';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import CollaborationTemplatePreview from '../Previews/CollaborationTemplatePreview';
import { useCollaborationTemplateContentQuery } from '../../../../core/apollo/generated/apollo-hooks';

export interface CollaborationTemplateFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  collaborationId?: string;
  // TODO: Commented because in the future we may want to edit the IF states, for the moment we can just select another collaboration to make a template of it
  // innovationFlow?: {
  //   states: InnovationFlowState[];
  // };
  // callouts?: { .... }
}

interface CollaborationTemplateFormProps {
  template?: CollaborationTemplate;
  onSubmit: (values: CollaborationTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CollaborationTemplateFormSubmittedValues>) => ReactNode);
}

const validator = {
  collaborationId: yup.string().required(),
  /* innovationFlow: yup.object().shape({
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
      .max(MAX_INNOVATIONFLOW_STATES),
  }),
  callouts: ...
  */
};

const CollaborationTemplateForm = ({ template, onSubmit, actions }: CollaborationTemplateFormProps) => {
  const initialValues: CollaborationTemplateFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfile(template?.profile),
    collaborationId: template?.collaboration?.id ?? '',
    /*innovationFlow: {
      states: template?.collaboration?.innovationFlow?.states ?? [],
    },*/
  };

  const { t } = useTranslation();

  /* No edit functionality for the moment
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
  */
  // Just load the innovation flow and the callouts of the selected collaboration and show it
  const { data, loading } = useCollaborationTemplateContentQuery({
    variables: {
      collaborationId: template?.collaboration?.id!,
    },
    skip: !template?.collaboration?.id,
  });
  const collaborationPreview = {
    collaboration: data?.lookup.collaboration,
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.Collaboration}
      template={template}
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {
        (/*{ values, setFieldValue, setFieldTouched }*/) => {
          /*const setStates = (states: InnovationFlowState[]) => {
          setFieldTouched('innovationFlow.states', true);
          setFieldValue('innovationFlow.states', states);
        };*/

          return (
            <>
              <BlockSectionTitle>{t('common.states')}</BlockSectionTitle>
              <FormikInputField title="collab id" name="collaborationId" />
              <CollaborationTemplatePreview loading={loading} template={collaborationPreview} />
              {/*
            <InnovationFlowDragNDropEditor
              innovationFlowStates={values.innovationFlow.states}
              onCreateFlowState={(newState, options) =>
                onCreateState(values.innovationFlow.states, newState, options, setStates)
              }
              onEditFlowState={(oldState, newState) =>
                onEditState(values.innovationFlow.states, oldState, newState, setStates)
              }
              onDeleteFlowState={stateName => onDeleteState(values.innovationFlow.states, stateName, setStates)}
              onUpdateFlowStateOrder={(states, sortOrder) =>
                onSortStates(values.innovationFlow.states, states, sortOrder, setStates)
              }
            />
            */}
              {/* Callouts Previewer/Editor .... */}
            </>
          );
        }
      }
    </TemplateFormBase>
  );
};

export default CollaborationTemplateForm;
