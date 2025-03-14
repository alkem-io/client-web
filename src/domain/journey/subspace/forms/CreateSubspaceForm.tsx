import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { MessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetField } from '@/domain/platform/admin/components/Common/TagsetSegment';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import {
  JourneyCreationForm,
  JourneyFormValues,
} from '@/domain/shared/components/JourneyCreationDialog/JourneyCreationForm';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { FormikRadiosSwitch } from '@/core/ui/forms/FormikRadiosSwitch';
import SubspaceTemplateSelector from '@/domain/templates/components/TemplateSelectors/SubspaceTemplateSelector';
import Gutters from '@/core/ui/grid/Gutters';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import FormikVisualUpload from '@/core/ui/upload/FormikVisualUpload/FormikVisualUpload';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { Theme, useMediaQuery } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

const FormikEffect = FormikEffectFactory<CreateSubspaceFormValues>();

type CreateSubspaceFormValues = Pick<
  JourneyFormValues,
  'displayName' | 'tagline' | 'description' | 'tags' | 'addTutorialCallouts' | 'collaborationTemplateId' | 'visuals'
>;

interface CreateSubspaceFormProps extends JourneyCreationForm {}

export const CreateSubspaceForm = ({
  isSubmitting,
  onValidChanged,
  onChanged,
}: PropsWithChildren<CreateSubspaceFormProps>) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const validationRequiredString = t('forms.validations.required');

  const handleChanged = (value: CreateSubspaceFormValues) =>
    onChanged({
      displayName: value.displayName,
      tagline: value.tagline,
      description: value.description,
      tags: value.tags,
      addTutorialCallouts: value.addTutorialCallouts,
      collaborationTemplateId: value.collaborationTemplateId,
      visuals: value.visuals,
    });

  const initialValues: CreateSubspaceFormValues = {
    displayName: '',
    tagline: '',
    description: '',
    tags: [],
    addTutorialCallouts: false,
    collaborationTemplateId: undefined,
    visuals: {
      avatar: { file: undefined, altText: '' },
      cardBanner: { file: undefined, altText: '' },
    },
  };

  const validationSchema = yup.object().shape({
    displayName: yup
      .string()
      .trim()
      .min(3, MessageWithPayload('forms.validations.minLength'))
      .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
      .required(validationRequiredString),
    tagline: yup
      .string()
      .trim()
      .min(3, MessageWithPayload('forms.validations.minLength'))
      .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    tags: yup.array().of(yup.string().min(2)).notRequired(),
    collaborationTemplateId: yup.string().nullable(),
  });
  const level = SpaceLevel.L1;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {() => (
        <Form noValidate>
          <FormikEffect onChange={handleChanged} onStatusChange={onValidChanged} />
          <FormikInputField
            name="displayName"
            title={t(`context.${level}.displayName.title`)}
            helperText={t(`context.${level}.displayName.description`)}
            disabled={isSubmitting}
            maxLength={SMALL_TEXT_LENGTH}
          />
          <FormikInputField
            name="tagline"
            title={t(`context.${level}.tagline.title`)}
            helperText={t(`context.${level}.tagline.description`)}
            disabled={isSubmitting}
            maxLength={SMALL_TEXT_LENGTH}
          />
          <FormikMarkdownField
            name="description"
            title={t(`context.${level}.description.title`)}
            rows={5}
            helperText={t(`context.${level}.description.description`)}
            disabled={isSubmitting}
            maxLength={MARKDOWN_TEXT_LENGTH}
            temporaryLocation
          />
          <TagsetField
            name="tags"
            disabled={isSubmitting}
            title={t(`context.${level}.tags.title`)}
            helperText={t(`context.${level}.tags.description`)}
            helpTextIcon={t(`context.${level}.tags.tooltip`)}
          />
          <Gutters padding={theme => `${gutters()(theme)} 0 0 0`}>
            <PageContentBlock sx={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between' }}>
              <FormikVisualUpload name="visuals.avatar" visualType={VisualType.Avatar} flex={1} />
              <FormikVisualUpload name="visuals.cardBanner" visualType={VisualType.Card} flex={1} />
            </PageContentBlock>
            <SubspaceTemplateSelector name="collaborationTemplateId" disablePadding />
            <FormikRadiosSwitch
              name="addTutorialCallouts"
              label="Tutorials:"
              options={[
                { label: 'On', value: true },
                { label: 'Off', value: false },
              ]}
              row
              disablePadding
            />
          </Gutters>
        </Form>
      )}
    </Formik>
  );
};
