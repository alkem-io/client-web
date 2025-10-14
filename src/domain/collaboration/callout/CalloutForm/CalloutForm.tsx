import {
  CalloutAllowedContributors,
  CalloutContributionType,
  CalloutFramingType,
  CalloutVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { urlValidator } from '@/core/ui/forms/validator/urlValidator';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Identifiable } from '@/core/utils/Identifiable';
import { nameOf } from '@/core/utils/nameOf';
import ReferenceSegment, { referenceSegmentSchema } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import { Box } from '@mui/material';
import { Formik, FormikConfig } from 'formik';
import { cloneDeep } from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { DefaultCalloutSettings } from '../../callout/models/CalloutSettingsModel';
import CalloutFormContributionSettings from './CalloutFormContributionSettings';
import CalloutFormFramingSettings from './CalloutFormFramingSettings';
import { CalloutFormSubmittedValues, DefaultCalloutFormValues } from './CalloutFormModel';
import { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import ProfileReferenceSegment from '@/domain/platformAdmin/components/Common/ProfileReferenceSegment';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

export type CalloutStructuredResponseType = 'none' | CalloutContributionType;

export const calloutValidationSchema = yup.object().shape({
  framing: yup.object().shape({
    profile: yup.object().shape({
      id: textLengthValidator(),
      displayName: displayNameValidator.required(),
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).nullable(),
      tagsets: tagsetsSegmentSchema,
      references: referenceSegmentSchema,
    }),
    type: yup
      .mixed<CalloutFramingType>()
      .oneOf(Object.values(CalloutFramingType).filter(value => typeof value === 'string'))
      .required(),
    whiteboard: yup.object().when(['type'], ([type], schema) => {
      return type === CalloutFramingType.Whiteboard ? schema.required() : schema;
    }),
    link: yup.object().when(['type'], ([type], schema) => {
      return type === CalloutFramingType.Link
        ? schema
            .shape({
              uri: urlValidator({ required: true }),
              profile: yup
                .object()
                .shape({
                  displayName: textLengthValidator({ required: true }),
                })
                .required(),
            })
            .required()
        : schema.nullable();
    }),
  }),
  contributionDefaults: yup.object().shape({
    defaultDisplayName: displayNameValidator.optional().nullable(),
    postDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).nullable(),
    whiteboardContent: textLengthValidator().nullable(),
  }),
  contributions: yup.object().shape({
    links: referenceSegmentSchema.nullable(),
  }),
  settings: yup.object().shape({
    contribution: yup.object().shape({
      enabled: yup.boolean().required(),
      allowedTypes: yup
        .mixed<string>()
        .oneOf(['none', ...Object.values(CalloutContributionType)].filter(value => typeof value === 'string'))
        .required(),
      canAddContributions: yup
        .mixed<CalloutAllowedContributors>()
        .oneOf(Object.values(CalloutAllowedContributors).filter(value => typeof value === 'string'))
        .required(),
      commentsEnabled: yup.boolean().required(),
    }),
    framing: yup.object().shape({
      commentsEnabled: yup.boolean().required(),
    }),
    visibility: yup
      .mixed<CalloutVisibility>()
      .oneOf(Object.values(CalloutVisibility).filter(value => typeof value === 'string'))
      .required(),
  }),
});

const FormikEffect = FormikEffectFactory<CalloutFormSubmittedValues>();

export interface CalloutFormProps {
  callout?: Partial<Identifiable> & CalloutFormSubmittedValues;
  onChange?: (values: CalloutFormSubmittedValues) => void;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<CalloutFormSubmittedValues>['children'];
  calloutRestrictions?: CalloutRestrictions;
  containerProps?: GuttersProps;
  /** is the form used for editing an existing callout */
  edit?: boolean;
  /** is the form used inside a template creation flow */
  template?: boolean;
}

const CalloutForm = ({
  callout,
  onChange,
  onStatusChanged,
  calloutRestrictions,
  containerProps,
  edit = false,
  template = false,
  children,
}: CalloutFormProps) => {
  const { t } = useTranslation();

  const { isSmallScreen } = useScreenSize();

  const initialValues: CalloutFormSubmittedValues = useMemo(() => {
    if (callout) {
      return callout;
    } else {
      const emptyCallout = cloneDeep(DefaultCalloutFormValues);
      emptyCallout.settings.framing.commentsEnabled = !calloutRestrictions?.disableComments;

      return emptyCallout;
    }
  }, [callout, DefaultCalloutSettings]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={calloutValidationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {formikState => (
        <>
          <Gutters {...containerProps}>
            <FormikEffect onChange={onChange} onStatusChange={onStatusChanged} />
            <Box display="flex" gap={gutters()} flexDirection={isSmallScreen ? 'column' : 'row'}>
              <FormikInputField
                name={nameOf<CalloutFormSubmittedValues>('framing.profile.displayName')}
                title={t('common.title')}
                required
                containerProps={{ sx: { flex: 1 } }}
              />
              <Box sx={isSmallScreen ? undefined : { width: '30%', minWidth: gutters(10) }}>
                <TagsetSegment
                  name={nameOf<CalloutFormSubmittedValues>('framing.profile.tagsets')}
                  title={t('common.tags')}
                  helpText={t('components.post-creation.info-step.tags-help-text')}
                />
              </Box>
            </Box>
            <FormikMarkdownField
              name={nameOf<CalloutFormSubmittedValues>('framing.profile.description')}
              title={t('components.callout-creation.info-step.description')}
              rows={7}
              maxLength={MARKDOWN_TEXT_LENGTH}
              temporaryLocation={!Boolean(callout?.id)}
              hideImageOptions={calloutRestrictions?.disableRichMedia}
            />
            <CalloutFormFramingSettings calloutRestrictions={calloutRestrictions} edit={edit} template={template} />
            {formikState.values.framing.profile.id ? (
              <ProfileReferenceSegment
                profileId={formikState.values.framing.profile.id}
                compactMode
                fieldName="framing.profile.references"
                references={formikState.values.framing.profile.references ?? []}
                marginTop={gutters(-1)}
                fullWidth
              />
            ) : (
              <ReferenceSegment
                fieldName={nameOf<CalloutFormSubmittedValues>('framing.profile.references')}
                compactMode
                references={formikState.values.framing.profile.references}
                temporaryLocation={calloutRestrictions?.temporaryLocation}
                fullWidth
              />
            )}
            <CalloutFormContributionSettings calloutRestrictions={calloutRestrictions} />
          </Gutters>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default CalloutForm;
