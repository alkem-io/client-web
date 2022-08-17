import React, { FC, useMemo } from 'react';
import { Formik, FormikConfig } from 'formik';
import { CalloutType } from '../../../../../models/graphql-schema';
import * as yup from 'yup';
import { Grid, InputAdornment } from '@mui/material';
import FormikEffectFactory from '../../../../../utils/formik/formik-effect/FormikEffect';
import FormikInputField from '../../../forms/FormikInputField';
import FormRow from '../../../../../domain/shared/layout/FormLayout';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../../../../domain/shared/components/Section/Section';
import MarkdownInput from '../../../../Admin/Common/MarkdownInput';
import { MID_TEXT_LENGTH } from '../../../../../models/constants/field-length.constants';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import HelpButton from '../../../../core/HelpButton';
import FormikSelect from '../../../forms/FormikSelect';

type FormValueType = {
  displayName: string;
  description: string;
  type: CalloutType;
};

const FormikEffect = FormikEffectFactory<FormValueType>();

export type CalloutFormInput = {
  displayName?: string;
  description?: string;
  type?: CalloutType;
}

export type CalloutFormOutput = {
  displayName: string;
  description: string;
  type: CalloutType;
};

export interface CalloutFormProps {
  callout?: CalloutFormInput;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<FormValueType>['children'];
}

const CalloutForm: FC<CalloutFormProps> = ({ callout, onChange, onStatusChanged, children }) => {
  const { t } = useTranslation();

  const initialValues: FormValueType = {
    displayName: callout?.displayName ?? '',
    description: callout?.description ?? '',
    type: callout?.type ?? CalloutType.Card,
  };

  const validationSchema = yup.object().shape({
    displayName: yup.string().required().max(255),
    description: yup.string().required().max(65535), // https://mariadb.com/kb/en/text
    type: yup.string().required(),
  });

  const handleChange = (values: FormValueType) => {
    const callout: CalloutFormOutput = {
      displayName: values.displayName,
      description: values.description,
      type: values.type,
    };
    onChange?.(callout);
  };

  const helpText = useMemo(() => {
    if (callout?.type === CalloutType.Card) {
      return t('components.callout-creation.info-step.type-cards-help');
    } else if (callout?.type === CalloutType.Canvas) {
      return t('components.callout-creation.info-step.type-canvases-help');
    } if (callout?.type === CalloutType.Discussion) {
      return t('components.callout-creation.info-step.type-comments-help');
    } else {
      return '';
    }
  }, [callout]);

  const calloutTypes = [
    { id: CalloutType.Card, name: 'Cards' },
    { id: CalloutType.Canvas, name: 'Canvases' },
  ];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {formikState => (
        <>
        <Grid container spacing={2}>
          <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
          <FormRow cols={1}>
            <FormikInputField
              name="displayName"
              title={t('common.title')}
              placeholder={t('common.title')}
            />
          </FormRow>
          <SectionSpacer />
          <MarkdownInput
            name="description"
            label={t('components.callout-creation.info-step.description')}
            rows={7}
            maxLength={MID_TEXT_LENGTH}
            withCounter
          />
          <SectionSpacer />
          <FormRow>
            <FormikSelect
              name="type"
              title={t('components.callout-creation.info-step.callout-label')}
              values={calloutTypes}
              endAdornment={
                <InputAdornment position="start">
                  <HelpButton
                    helpText={helpText}
                  />
                </InputAdornment>
              }
            />
          </FormRow>
        </Grid>
        {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  )
};
export default CalloutForm;
