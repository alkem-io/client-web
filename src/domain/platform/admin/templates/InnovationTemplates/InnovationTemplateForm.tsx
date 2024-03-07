import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FieldMetaProps, FormikProps } from 'formik';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import FormRows from '../../../../shared/components/FormRows';
import TemplateForm from '../TemplateForm';
import { BlockSectionTitle } from '../../../../../core/ui/typography';
import { Box, FormLabel, TextareaAutosize, useTheme } from '@mui/material';
import InnovationFlowVisualizer from './InnovationFlowVisualizer';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlow';
import { gutters } from '../../../../../core/ui/grid/utils';
import { LONG_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';

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

interface InnovationTemplateFormProps {
  initialValues: Partial<InnovationTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<InnovationTemplateFormValues>) => ReactNode);
}

const validator = {
  displayName: yup.string().required().max(SMALL_TEXT_LENGTH),
  description: yup.string().required().max(SMALL_TEXT_LENGTH),
  // TODO: Fix this validation, it's not building
  //tags: yup.array().of(yup.string().min(2)).notRequired(),
  // states: yup.array().of(yup.object().shape({
  //   displayName: yup.string().required().max(MAX_LENGTH_STATE_DISPLAY_NAME),
  //   description: yup.string().max(MAX_LENGTH_STATE_DESCRIPTION),
  // })),
};

// This function parses the states string array very carefully because this lets the users input any JSON.
const parseStates = (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    const result: InnovationFlowState[] = [];
    if (Array.isArray(data) && data.length > 0) {
      if (data.length > MAX_NUMBER_OF_STATES) {
        return { isValid: false, states: [], error: 'Too many states.' };
      }
      for (const state of data) {
        if (
          typeof state.displayName === 'string' &&
          state.displayName.length > 0 &&
          state.displayName.length <= MAX_LENGTH_STATE_DISPLAY_NAME &&
          typeof state.description === 'string' &&
          state.description.length <= MAX_LENGTH_STATE_DESCRIPTION
        ) {
          // State is valid, add it to the result array
          result.push({ displayName: state.displayName, description: state.description });
        } else {
          return { isValid: false, states: [], error: 'Invalid state.' };
        }
      }
      return { isValid: true, states: result };
    }
    return { isValid: false, states: [], error: 'Not valid states array.' };
  } catch (ex) {
    return { isValid: false, states: [], error: 'Error parsing states array.' };
  }
};

const InnovationTemplateForm = ({ initialValues, visual, onSubmit, actions }: InnovationTemplateFormProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const textAreaStyle = ({ touched, error }: FieldMetaProps<unknown>) => {
    return {
      width: gutters(18)(theme),
      maxWidth: gutters(18)(theme),
      minWidth: gutters(18)(theme),
      borderColor: touched && error ? `${theme.palette.error.main}` : undefined,
    };
  };

  const [statesString, setStatesString] = useState(
    JSON.stringify(
      initialValues.states?.map(state => ({ displayName: state.displayName, description: state.description }))
    )
  );

  return (
    <TemplateForm
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {({ values, setFieldValue, getFieldMeta, setFieldError, setFieldTouched }) => (
        <FormRows>
          <FormLabel title={t('innovation-templates.states.title')}>
            <TextareaAutosize
              placeholder={t('innovation-templates.states.placeholder')}
              value={statesString}
              maxRows={10}
              minRows={10}
              style={textAreaStyle(getFieldMeta('states'))}
              onFocus={() => {
                setFieldTouched('states', true);
                const { isValid, error } = parseStates(statesString);
                setFieldError('states', !isValid ? error : undefined);
              }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                const newStatesString = event.target.value;
                setStatesString(newStatesString);
                const { isValid, error } = parseStates(newStatesString);
                setFieldError('states', !isValid ? error : undefined);
              }}
              onBlur={() => {
                const { isValid, states, error } = parseStates(statesString);
                if (isValid) {
                  setFieldError('states', undefined);
                  setFieldValue('states', states);
                  setStatesString(JSON.stringify(states));
                } else {
                  setFieldError('states', error);
                }
              }}
            />
          </FormLabel>
          <BlockSectionTitle>{t('common.preview')}</BlockSectionTitle>
          <Box sx={{ maxWidth: theme => theme.spacing(64) }}>
            <InnovationFlowVisualizer states={values.states} />
          </Box>
        </FormRows>
      )}
    </TemplateForm>
  );
};

export default InnovationTemplateForm;
