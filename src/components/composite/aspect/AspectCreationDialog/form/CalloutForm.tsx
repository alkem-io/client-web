import React, { FC } from 'react';
import { Formik, FormikConfig } from 'formik';
import { CalloutType } from '../../../../../models/graphql-schema';
import * as yup from 'yup';
import { FormControlLabel, Grid } from '@mui/material';
import FormikEffectFactory from '../../../../../utils/formik/formik-effect/FormikEffect';
import FormikInputField from '../../../forms/FormikInputField';
import FormRow from '../../../../../domain/shared/layout/FormLayout';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../../../../domain/shared/components/Section/Section';
import MarkdownInput from '../../../../Admin/Common/MarkdownInput';
import { MID_TEXT_LENGTH } from '../../../../../models/constants/field-length.constants';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';

type FormValueType = {
  displayName: string;
  description: string;
  type: CalloutType;
};

const FormikEffect = FormikEffectFactory<FormValueType>();

export type CalloutFromInput = {
  displayName: string;
  description: string;
  type: CalloutType;
}

export type CalloutFormOutput = {
  displayName: string;
  description: string;
  type: CalloutType;
};

export interface CalloutFormProps {
  callout?: CalloutFromInput;
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
  });

  const handleChange = (values: FormValueType) => {
    const callout: CalloutFormOutput = {
      displayName: values.displayName,
      description: values.description,
      type: values.type,
    };
    onChange?.(callout);
  };

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
          <FormRow cols={2}>
            <FormikInputField
              name={'displayName'}
              title={t('common.title')}
              required
              placeholder={t('common.title')}
            />
          </FormRow>
          <SectionSpacer />
          <MarkdownInput
            name="description"
            label={t('components.callout-creation.info-step.description')}
            required
            rows={7}
            maxLength={MID_TEXT_LENGTH}
            withCounter
          />
          <SectionSpacer />
          <InputLabel id="callout-type">{t('components.callout-creation.info-step.callout-label')}</InputLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="female"
            name="radio-buttons-group"
          >
            <FormControlLabel value="comment" control={<Radio />} label={t('common.comments')} />
            <FormControlLabel value="card" control={<Radio />} label={t('common.cards')} />
            <FormControlLabel value="canvas" control={<Radio />} label={t('common.canvases')} />
          </RadioGroup>
        </Grid>
        {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  )
};
export default CalloutForm;
