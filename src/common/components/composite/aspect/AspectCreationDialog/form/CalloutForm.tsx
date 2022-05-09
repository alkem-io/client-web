import React, { FC, useMemo } from 'react';
import { Formik, FormikConfig } from 'formik';
import { CalloutType } from '../../../../../../models/graphql-schema';
import * as yup from 'yup';
import { Grid, InputAdornment } from '@mui/material';
import FormikEffectFactory from '../../../../../utils/formik/formik-effect/FormikEffect';
import FormikInputField from '../../../forms/FormikInputField';
import FormRow from '../../../../../../domain/shared/layout/FormLayout';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../../../../../domain/shared/components/Section/Section';
import MarkdownInput from '../../../../../../domain/admin/components/Common/MarkdownInput';
import { MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../../../models/constants/field-length.constants';
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
};

export type CalloutFormOutput = {
  displayName: string;
  description: string;
  type: CalloutType;
};

export interface CalloutFormProps {
  callout?: CalloutFormInput;
  edit?: boolean;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<FormValueType>['children'];
}

const CalloutForm: FC<CalloutFormProps> = ({ callout, edit = false, onChange, onStatusChanged, children }) => {
  const { t } = useTranslation();

  const initialValues: FormValueType = {
    displayName: callout?.displayName ?? '',
    description: callout?.description ?? '',
    type: callout?.type ?? CalloutType.Card,
  };

  const validationSchema = yup.object().shape({
    displayName: yup
      .string()
      .required(t('common.field-required'))
      .min(3, ({ min }) => t('common.field-min-length', { min }))
      .max(SMALL_TEXT_LENGTH, ({ max }) => t('common.field-max-length', { max })),
    description: yup
      .string()
      .required()
      .min(3, ({ min }) => t('common.field-min-length', { min }))
      .max(500, ({ max }) => t('common.field-max-length', { max })),
    type: yup.string().required(t('common.field-required')),
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
    switch (callout?.type) {
      case CalloutType.Card:
        return t('components.callout-creation.info-step.type-cards-help');
      case CalloutType.Canvas:
        return t('components.callout-creation.info-step.type-canvases-help');
      case CalloutType.Discussion:
        return t('components.callout-creation.info-step.type-comments-help');
      default:
        return '';
    }
  }, [callout]);

  const calloutTypes = useMemo(
    () => [
      { id: CalloutType.Card, name: t('common.cards') },
      { id: CalloutType.Canvas, name: t('common.canvases') },
    ],
    []
  );

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
              <FormikInputField name="displayName" title={t('common.title')} placeholder={t('common.title')} />
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
                disabled={edit}
                title={t('components.callout-creation.callout-type-label')}
                values={calloutTypes}
                endAdornment={
                  <InputAdornment position="start">
                    <HelpButton helpText={helpText} />
                  </InputAdornment>
                }
              />
            </FormRow>
          </Grid>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};
export default CalloutForm;
