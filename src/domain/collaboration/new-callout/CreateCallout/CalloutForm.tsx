import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Identifiable } from '@/core/utils/Identifiable';
import { nameOf } from '@/core/utils/nameOf';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { EmptyTagset, TagsetModel } from '@/domain/common/tagset/TagsetModel';
import ReferenceSegment, { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { Box } from '@mui/material';
import { Formik, FormikConfig } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from '../../callout/creationDialog/CalloutWhiteboardField/CalloutWhiteboardField';
import CalloutFormAdditionalContent from './CalloutFormFramingSettings';
import CalloutFormResponseOptions from './CalloutFormResponseOptions';
import { CalloutAllowedContributors, CalloutFramingType, CalloutStructuredResponseType } from './constants';
import { CalloutVisibility } from '@/core/apollo/generated/graphql-schema';

export interface CalloutFormSubmittedValues {
  framing: {
    profile: {
      displayName: string;
      description: string;
      tagsets: TagsetModel[];
      references: ReferenceModel[];
    };
    whiteboard: WhiteboardFieldSubmittedValuesWithPreviewImages | undefined;
  };
  contributionDefaults: {
    postDescription: string | undefined;
    whiteboardContent: string | undefined;
  };
  settings: {
    contribution: {
      enabled: boolean;
      allowedTypes: CalloutStructuredResponseType;
      canAddContributions: CalloutAllowedContributors;
      commentsEnabled: boolean;
    };
    framing: {
      type: CalloutFramingType;
      commentsEnabled: boolean;
    };
    visibility: CalloutVisibility;
  };
}

const FormikEffect = FormikEffectFactory<CalloutFormSubmittedValues>();

export interface CalloutFormProps {
  callout?: Partial<Identifiable> & CalloutFormSubmittedValues;
  onStatusChanged?: (isValid: boolean) => void;
  children?: FormikConfig<CalloutFormSubmittedValues>['children'];
  disableRichMedia?: boolean; // images, videos, iframe, etc.
  /*temporaryLocation?: boolean;
  disablePostResponses?: boolean;
  */
}

const CalloutForm = ({
  callout,
  onStatusChanged,
  children,
  disableRichMedia,
  /*temporaryLocation = false,
  disablePostResponses = false,
  */
}: CalloutFormProps) => {
  const { t } = useTranslation();

  const { isSmallScreen } = useScreenSize();

  const initialValues: CalloutFormSubmittedValues = useMemo(
    () =>
      callout
        ? callout
        : {
            framing: {
              profile: {
                displayName: '',
                description: '',
                tagsets: [EmptyTagset],
                references: [],
              },
              whiteboard: undefined,
            },
            contributionDefaults: {
              postDescription: undefined,
              whiteboardContent: undefined,
            },
            settings: {
              contribution: {
                enabled: true,
                allowedTypes: 'none',
                canAddContributions: CalloutAllowedContributors.Members,
                commentsEnabled: true,
              },
              framing: {
                type: CalloutFramingType.None,
                commentsEnabled: true,
              },
              visibility: CalloutVisibility.Published,
            },
          },
    [callout?.id]
  );

  const temporaryLocation = !Boolean(callout?.id); // Callout doesn't exist yet => enable temporary location

  const validationSchema = yup.object().shape({
    framing: yup.object().shape({
      profile: yup.object().shape({
        displayName: displayNameValidator,
        description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
        tagsets: tagsetsSegmentSchema,
        references: referenceSegmentSchema,
      }),
      whiteboard: yup.object().when(['settings.framing.type'], ([type], schema) => {
        return type === CalloutFramingType.Whiteboard ? schema.required() : schema;
      }),
    }),
  });

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
          <Gutters>
            <FormikEffect onStatusChange={onStatusChanged} />
            <Box display="flex" gap={gutters()} flexDirection={isSmallScreen ? 'column' : 'row'}>
              <FormikInputField
                name={nameOf<CalloutFormSubmittedValues>('framing.profile.displayName')}
                title={t('common.title')}
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
              name="description"
              title={t('components.callout-creation.info-step.description')}
              rows={7}
              maxLength={MARKDOWN_TEXT_LENGTH}
              temporaryLocation={!Boolean(callout?.id)}
              hideImageOptions={disableRichMedia}
            />
            <CalloutFormAdditionalContent />
            <ReferenceSegment
              fieldName={nameOf<CalloutFormSubmittedValues>('framing.profile.references')}
              compactMode
              references={formikState.values.framing.profile.references}
              temporaryLocation={temporaryLocation}
              fullWidth
            />
            <CalloutFormResponseOptions />
            {/*
            <PostTemplateSelector name="postDescription" />
            <WhiteboardTemplateSelector name="whiteboardContent" />
            <FormikSwitch name="opened" title={t('callout.state-permission')} />
             */}
          </Gutters>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default CalloutForm;
