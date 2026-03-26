import { Box } from '@mui/material';
import { Formik, type FormikConfig } from 'formik';
import { cloneDeep } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import type { CalloutContributionType, PollStatus } from '@/core/apollo/generated/graphql-schema';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters, { type GuttersProps } from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import type { Identifiable } from '@/core/utils/Identifiable';
import { nameOf } from '@/core/utils/nameOf';
import ProfileReferenceSegment from '@/domain/platformAdmin/components/Common/ProfileReferenceSegment';
import ReferenceSegment from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { TagsetSegment } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import type { CalloutRestrictions } from '../../callout/CalloutRestrictionsTypes';
import { calloutValidationSchema } from './CalloutForm.validation.schema';
import CalloutFormContributionSettings from './CalloutFormContributionSettings';
import CalloutFormFramingSettings from './CalloutFormFramingSettings';
import { type CalloutFormSubmittedValues, DefaultCalloutFormValues } from './CalloutFormModel';

export type CalloutStructuredResponseType = 'none' | CalloutContributionType;

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
  pollId?: string;
  pollStatus?: PollStatus;
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
  pollId,
  pollStatus,
}: CalloutFormProps) => {
  const { t } = useTranslation();

  const { isSmallScreen } = useScreenSize();

  const initialValues: CalloutFormSubmittedValues = (() => {
    if (callout) {
      return callout;
    } else {
      const emptyCallout = cloneDeep(DefaultCalloutFormValues);
      if (typeof calloutRestrictions?.disableComments === 'boolean') {
        emptyCallout.settings.framing.commentsEnabled = !calloutRestrictions.disableComments;
      }
      if (typeof calloutRestrictions?.disableCommentsToContributions === 'boolean') {
        emptyCallout.settings.contribution.commentsEnabled = !calloutRestrictions.disableCommentsToContributions;
      }

      return emptyCallout;
    }
  })();

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={calloutValidationSchema}
      enableReinitialize={true}
      validateOnMount={true}
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
                required={true}
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
              temporaryLocation={!callout?.id}
              hideImageOptions={calloutRestrictions?.disableRichMedia}
            />
            <CalloutFormFramingSettings
              calloutRestrictions={calloutRestrictions}
              edit={edit}
              template={template}
              pollId={pollId}
              pollStatus={pollStatus}
            />
            {formikState.values.framing.profile.id ? (
              <ProfileReferenceSegment
                profileId={formikState.values.framing.profile.id}
                compactMode={true}
                fieldName="framing.profile.references"
                references={formikState.values.framing.profile.references ?? []}
                marginTop={gutters(-1)}
                fullWidth={true}
              />
            ) : (
              <ReferenceSegment
                fieldName={nameOf<CalloutFormSubmittedValues>('framing.profile.references')}
                compactMode={true}
                references={formikState.values.framing.profile.references}
                temporaryLocation={calloutRestrictions?.temporaryLocation}
                fullWidth={true}
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
