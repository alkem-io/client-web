import { useMemo } from 'react';
import { Formik, FormikConfig } from 'formik';
import { CalloutState, CalloutType, TagsetReservedName, TagsetType } from '@/core/apollo/generated/graphql-schema';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { FormikSwitch } from '@/core/ui/forms/FormikSwitch';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import ReferenceSegment, { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { ProfileReferenceSegment } from '@/domain/platform/admin/components/Common/ProfileReferenceSegment';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { Caption } from '@/core/ui/typography';
import CalloutWhiteboardField, {
  WhiteboardFieldSubmittedValues,
  WhiteboardFieldSubmittedValuesWithPreviewImages,
} from '../../callout/creationDialog/CalloutWhiteboardField/CalloutWhiteboardField';
import PostTemplateSelector from '@/domain/templates/components/TemplateSelectors/PostTemplateSelector';
import WhiteboardTemplateSelector from '@/domain/templates/components/TemplateSelectors/WhiteboardTemplateSelector';
import { EmptyTagset, TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { Identifiable } from '@/core/utils/Identifiable';
import { Box } from '@mui/material';
import { useColumns } from '@/core/ui/grid/GridContext';
import { useScreenSize } from '@/core/ui/grid/constants';
import { nameOf } from '@/core/utils/nameOf';

interface CalloutFormSubmittedValues {
  profile: {
    displayName: string;
    description: string;
    tagsets: TagsetModel[];
    references: ReferenceModel[];
  };
  /*opened: boolean;
  postDescription?: string;
  whiteboardContent?: string;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
  */
};

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
  disableRichMedia
  /*temporaryLocation = false,
  disablePostResponses = false,
  */
}: CalloutFormProps) => {
  const { t } = useTranslation();

  const { isSmallScreen } = useScreenSize();

  const initialValues: CalloutFormSubmittedValues = useMemo(
    () => ({
      profile: {
        displayName: callout?.profile.displayName ?? '',
        description: callout?.profile.description ?? '',
        tagsets: callout?.profile.tagsets ?? [EmptyTagset],
        references: callout?.profile.references ?? [],
      },
      /*
      opened: !disablePostResponses && (callout?.state ?? CalloutState.Open) === CalloutState.Open,
      postDescription: callout.postDescription ?? '',
      whiteboardContent: callout.whiteboardContent ?? EmptyWhiteboardString,
      whiteboard: callout?.whiteboard
        ? {
            ...callout.whiteboard,
            previewImages: undefined,
          }
        : {
            profile: {
              displayName: t('common.whiteboard'),
            },
            content: EmptyWhiteboardString,
            previewImages: undefined,
          },
          */
    }),
    [callout?.id]
  );

  const temporaryLocation = !Boolean(callout?.id);  // Callout doesn't exist yet => enable temporary location

  const validationSchema = yup.object().shape({
    profile: yup.object().shape({
      displayName: displayNameValidator,
      description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
      tagsets: tagsetsSegmentSchema,
      references: referenceSegmentSchema,
    }),
    /*    opened: yup.boolean().required(),
        whiteboardContent: yup.string().when(['type'], ([type], schema) => {
          return type === CalloutType.Whiteboard ? schema.required() : schema;
        }),
        */
  });


  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => { }}
    >
      {formikState => (
        <>
          <Gutters>
            <FormikEffect onStatusChange={onStatusChanged} />
            <Box display="flex" gap={gutters()} flexDirection={isSmallScreen ? 'column' : 'row'}>
              <FormikInputField
                name={nameOf<CalloutFormSubmittedValues>('profile.displayName')}
                title={t('common.title')}
                containerProps={{ sx: { flex: 1 } }}
              />
              <Box sx={isSmallScreen ? undefined : { width: '30%', minWidth: gutters(10) }}>
                <TagsetSegment
                  name={nameOf<CalloutFormSubmittedValues>('profile.displayName')}
                  tagsets={formikState.values.profile.tagsets}
                  title={t('common.tags')}
                  helpText={t('components.post-creation.info-step.tags-help-text')}
                />
              </Box>
              <FormikMarkdownField
                name="description"
                title={t('components.callout-creation.info-step.description')}
                rows={7}
                maxLength={MARKDOWN_TEXT_LENGTH}
                temporaryLocation={!Boolean(callout?.id)}
                hideImageOptions={disableRichMedia}
              />
            </Box>
            <CalloutWhiteboardField name="whiteboard" />
            <ReferenceSegment
              compactMode
              references={formikState.values.profile.references}
              marginTop={gutters(-1)}
              temporaryLocation={temporaryLocation}
            />
            <PostTemplateSelector name="postDescription" />
            <WhiteboardTemplateSelector name="whiteboardContent" />
            <FormikSwitch name="opened" title={t('callout.state-permission')} />
          </Gutters>
          {typeof children === 'function' ? (children as Function)(formikState) : children}
        </>
      )}
    </Formik>
  );
};

export default CalloutForm;
