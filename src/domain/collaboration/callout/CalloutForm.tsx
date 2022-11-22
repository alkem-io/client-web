import React, { FC, useMemo } from 'react';
import { Formik, FormikConfig } from 'formik';
import { CalloutState, CalloutType } from '../../../models/graphql-schema';
import * as yup from 'yup';
import { Grid, Typography } from '@mui/material';
import FormRow from '../../shared/layout/FormLayout';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../models/constants/field-length.constants';
import FormikInputField from '../../../common/components/composite/forms/FormikInputField';
import FormikEffectFactory from '../../../common/utils/formik/formik-effect/FormikEffect';
import MarkdownInput from '../../platform/admin/components/Common/MarkdownInput';
import { FormikSwitch } from '../../../common/components/composite/forms/FormikSwitch';
import CardTemplatesChooser from './creation-dialog/CalloutTemplate/CardTemplateChooser';
import CalloutTypeSelect from './creation-dialog/CalloutType/CalloutTypeSelect';

type FormValueType = {
  displayName: string;
  description: string;
  type: CalloutType;
  opened: boolean;
  cardTemplateType?: string;
};

const FormikEffect = FormikEffectFactory<FormValueType>();

export type CalloutFormInput = {
  id?: string;
  displayName?: string;
  description?: string;
  type?: CalloutType;
  state?: CalloutState;
  cardTemplateType?: string;
};

export type CalloutFormOutput = {
  displayName: string;
  description: string;
  type: CalloutType;
  state: CalloutState;
  cardTemplateType?: string;
};

export interface CalloutFormProps {
  callout?: CalloutFormInput;
  editMode?: boolean;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<FormValueType>['children'];
  calloutNames: string[];
}

const CalloutForm: FC<CalloutFormProps> = ({
  callout,
  calloutNames,
  editMode = false,
  onChange,
  onStatusChanged,
  children,
}) => {
  const { t } = useTranslation();

  const initialValues: FormValueType = useMemo(
    () => ({
      displayName: callout?.displayName ?? '',
      description: callout?.description ?? '',
      type: callout?.type ?? CalloutType.Comments,
      opened: (callout?.state ?? CalloutState.Open) === CalloutState.Open,
      cardTemplateType: callout?.cardTemplateType ?? '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callout?.id]
  );

  const displayNameSchema = yup
    .string()
    .required(t('common.field-required'))
    .min(3, ({ min }) => t('common.field-min-length', { min }))
    .max(SMALL_TEXT_LENGTH, ({ max }) => t('common.field-max-length', { max }))
    .test('is-valid-name', t('components.callout-creation.info-step.unique-title-validation-text'), value => {
      if (editMode) {
        return Boolean(value && (!calloutNames.includes(value) || value === callout?.displayName));
      } else {
        return Boolean(value && !calloutNames.includes(value));
      }
    });

  const validationSchema = yup.object().shape({
    displayName: displayNameSchema,
    description: yup
      .string()
      .required(t('common.field-required'))
      .min(3, ({ min }) => t('common.field-min-length', { min }))
      .max(500, ({ max }) => t('common.field-max-length', { max })),
    type: yup.string().required(t('common.field-required')),
    opened: yup.boolean().required(),
    cardTemplateType: yup
      .string()
      .when('type', { is: CalloutType.Card, then: yup.string().required(t('common.field-required')) }),
  });

  const handleChange = (values: FormValueType) => {
    const callout: CalloutFormOutput = {
      displayName: values.displayName,
      description: values.description,
      type: values.type,
      state: values.opened ? CalloutState.Open : CalloutState.Closed,
      cardTemplateType: values.cardTemplateType,
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
              <CalloutTypeSelect name="type" disabled={editMode} />
            </FormRow>
            {formikState.values.type === CalloutType.Card && (
              <>
                <SectionSpacer />
                <FormRow>
                  <CardTemplatesChooser name="cardTemplateType" editMode={editMode} />
                </FormRow>
              </>
            )}
            <SectionSpacer />
            <FormRow>
              {/* TODO: Add this color to pallete to match Formik labels */}
              <Typography sx={{ color: '#00000099' }}>{t('common.permission')}</Typography>
              <Typography sx={{ color: '#00000099' }} variant="body2">
                {t('callout.permission-helptext')}
              </Typography>
              <FormikSwitch name="opened" title={t('callout.state-permission')} />
            </FormRow>
          </Grid>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};
export default CalloutForm;
