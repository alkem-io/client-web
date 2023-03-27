import React, { FC, useCallback, useMemo, useState } from 'react';
import { Formik, FormikConfig } from 'formik';
import {
  PostTemplateFragment,
  CalloutState,
  CalloutType,
  WhiteboardTemplateFragment,
} from '../../../core/apollo/generated/graphql-schema';
import * as yup from 'yup';
import { Grid, Typography } from '@mui/material';
import FormRow from '../../shared/layout/FormLayout';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../shared/components/Section/Section';
import { MID_TEXT_LENGTH } from '../../../core/ui/forms/field-length.constants';
import FormikInputField from '../../../common/components/composite/forms/FormikInputField';
import FormikEffectFactory from '../../../common/utils/formik/formik-effect/FormikEffect';
import MarkdownInput from '../../platform/admin/components/Common/MarkdownInput';
import { FormikSwitch } from '../../../common/components/composite/forms/FormikSwitch';
import PostTemplatesChooser from './creation-dialog/CalloutTemplate/PostTemplateChooser';
import CalloutTypeSelect from './creation-dialog/CalloutType/CalloutTypeSelect';
import { displayNameValidator } from '../../../common/utils/validator/displayNameValidator';
import WhiteboardTemplatesChooser, {
  WhiteboardTemplateListItem,
  LibraryWhiteboardTemplate,
  TemplateOrigin,
} from './creation-dialog/CalloutTemplate/WhiteboardTemplateChooser';
import MarkdownValidator from '../../../core/ui/forms/MarkdownInput/MarkdownValidator';

export type WhiteboardTemplateData = {
  id?: string;
  displayName?: string;
  origin?: TemplateOrigin;
  innovationPackId?: string;
};

type FormValueType = {
  displayName: string;
  description: string;
  type: CalloutType;
  opened: boolean;
  postTemplateType?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
};

const FormikEffect = FormikEffectFactory<FormValueType>();

export type CalloutFormInput = {
  id?: string;
  displayName?: string;
  description?: string;
  type?: CalloutType;
  state?: CalloutState;
  postTemplateType?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
};

export type CalloutFormOutput = {
  displayName: string;
  description: string;
  type: CalloutType;
  state: CalloutState;
  postTemplateType?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
};

export interface CalloutFormProps {
  callout?: CalloutFormInput;
  editMode?: boolean;
  onChange?: (callout: CalloutFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<FormValueType>['children'];
  calloutNames: string[];
  templates: { postTemplates: PostTemplateFragment[]; whiteboardTemplates: WhiteboardTemplateFragment[] };
}

const CalloutForm: FC<CalloutFormProps> = ({
  callout,
  calloutNames,
  templates,
  editMode = false,
  onChange,
  onStatusChanged,
  children,
}) => {
  const { t } = useTranslation();
  const [libraryWhiteboardTemplates, setLibraryWhiteboardTemplates] = useState<WhiteboardTemplateListItem[]>([]);

  const initialValues: FormValueType = useMemo(
    () => ({
      displayName: callout?.displayName ?? '',
      description: callout?.description ?? '',
      type: callout?.type ?? CalloutType.Comments,
      opened: (callout?.state ?? CalloutState.Open) === CalloutState.Open,
      postTemplateType: callout?.postTemplateType ?? '',
      whiteboardTemplateData: callout?.whiteboardTemplateData ?? {
        id: '',
        title: '',
        origin: 'Hub',
      },
    }),
    [callout?.id]
  );

  const uniqueNameValidator = yup
    .string()
    .required(t('common.field-required'))
    .test('is-valid-name', t('components.callout-creation.info-step.unique-title-validation-text'), value => {
      if (editMode) {
        return Boolean(value && (!calloutNames.includes(value) || value === callout?.displayName));
      } else {
        return Boolean(value && !calloutNames.includes(value));
      }
    });

  const validationSchema = yup.object().shape({
    displayName: displayNameValidator.concat(uniqueNameValidator),
    description: MarkdownValidator(MID_TEXT_LENGTH)
      .required(t('common.field-required'))
      .min(3, ({ min }) => t('common.field-min-length', { min })),
    type: yup.string().required(t('common.field-required')),
    opened: yup.boolean().required(),
    postTemplateType: yup
      .string()
      .when('type', { is: CalloutType.Card, then: yup.string().required(t('common.field-required')) }),
    whiteboardTemplateData: yup.object().when('type', {
      is: CalloutType.Canvas,
      then: yup.object().shape({
        id: yup.string().required(),
        title: yup.string().required(),
        origin: yup.string().optional(),
        innovationPackId: yup.string().optional(),
      }),
    }),
  });

  const handleChange = (values: FormValueType) => {
    const callout: CalloutFormOutput = {
      displayName: values.displayName,
      description: values.description,
      type: values.type,
      state: values.opened ? CalloutState.Open : CalloutState.Closed,
      postTemplateType: values.postTemplateType,
      whiteboardTemplateData: values.whiteboardTemplateData,
    };
    onChange?.(callout);
  };

  const updateLibraryTemplates = useCallback(
    (template: LibraryWhiteboardTemplate) => {
      const newTemplate: WhiteboardTemplateListItem = { ...template, origin: 'Library' };
      setLibraryWhiteboardTemplates([...libraryWhiteboardTemplates, newTemplate]);
    },
    [libraryWhiteboardTemplates]
  );

  const hubTemplates = templates.whiteboardTemplates.map<WhiteboardTemplateListItem>(templ => ({
    ...templ,
    origin: 'Hub',
  }));

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
                  <PostTemplatesChooser
                    name="postTemplateType"
                    templates={templates.postTemplates}
                    editMode={editMode}
                  />
                </FormRow>
              </>
            )}
            {formikState.values.type === CalloutType.Canvas && (
              <>
                <SectionSpacer />
                <FormRow>
                  <WhiteboardTemplatesChooser
                    name="whiteboardTemplateData"
                    templates={[...hubTemplates, ...libraryWhiteboardTemplates]}
                    editMode={editMode}
                    onSelectLibraryTemplate={updateLibraryTemplates}
                  />
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
