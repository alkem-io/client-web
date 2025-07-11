import { PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetField } from '@/domain/platform/admin/components/Common/TagsetSegment';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import {
  SpaceCreationForm,
  SpaceFormValues,
} from '@/domain/space/components/CreateSpace/SubspaceCreationDialog/SubspaceCreationForm';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import SubspaceTemplateSelector from '@/domain/templates/components/TemplateSelectors/SubspaceTemplateSelector';
import Gutters from '@/core/ui/grid/Gutters';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import FormikVisualUpload from '@/core/ui/upload/FormikVisualUpload/FormikVisualUpload';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { EntityVisualUrls } from '@/domain/common/visual/utils/visuals.utils';

const FormikEffect = FormikEffectFactory<CreateSubspaceFormValues>();

type CreateSubspaceFormValues = Pick<
  SpaceFormValues,
  | 'displayName'
  | 'tagline'
  | 'description'
  | 'tags'
  | 'addTutorialCallouts'
  | 'addCallouts'
  | 'spaceTemplateId'
  | 'visuals'
>;

interface CreateSubspaceFormProps extends SpaceCreationForm {}

export const CreateSubspaceForm = ({
  isSubmitting,
  onValidChanged,
  onChanged,
}: PropsWithChildren<CreateSubspaceFormProps>) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();
  const [templateVisuals, setTemplateVisuals] = useState<EntityVisualUrls>({});

  const validationRequiredString = t('forms.validations.required');

  const handleChanged = (value: CreateSubspaceFormValues) =>
    onChanged({
      displayName: value.displayName,
      tagline: value.tagline,
      description: value.description,
      tags: value.tags,
      addTutorialCallouts: false,
      addCallouts: Boolean(value.spaceTemplateId) ? value.addCallouts : true,
      spaceTemplateId: value.spaceTemplateId || undefined, // in case of empty string
      visuals: value.visuals,
    });

  const handleTemplateVisualsLoaded = (visuals: EntityVisualUrls) => {
    setTemplateVisuals(visuals);
  };

  const initialValues: CreateSubspaceFormValues = {
    displayName: '',
    tagline: '',
    description: '',
    tags: [],
    addTutorialCallouts: false,
    addCallouts: true,
    spaceTemplateId: undefined,
    visuals: {
      avatar: { file: undefined, altText: '' },
      cardBanner: { file: undefined, altText: '' },
    },
  };

  const validationSchema = yup.object().shape({
    displayName: yup
      .string()
      .trim()
      .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
      .max(SMALL_TEXT_LENGTH, ({ max }) =>
        TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })
      )
      .required(validationRequiredString),
    tagline: yup
      .string()
      .trim()
      .min(3, ({ min }) => TranslatedValidatedMessageWithPayload('forms.validations.minLength')({ min }))
      .max(SMALL_TEXT_LENGTH, ({ max }) =>
        TranslatedValidatedMessageWithPayload('forms.validations.maxLength')({ max })
      ),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    tags: yup.array().of(yup.string().min(2)).notRequired(),
    spaceTemplateId: yup.string().nullable(),
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
          <SubspaceTemplateSelector
            name="spaceTemplateId"
            disablePadding
            sx={{ paddingBottom: gutters() }}
            onTemplateVisualsLoaded={handleTemplateVisualsLoaded}
          />
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
            <PageContentBlock sx={{ flexDirection: isSmallScreen ? 'column' : 'row', justifyContent: 'space-between' }}>
              <FormikVisualUpload
                name="visuals.avatar"
                visualType={VisualType.Avatar}
                flex={1}
                initialVisualUrl={templateVisuals.avatarUrl}
              />
              <FormikVisualUpload
                name="visuals.cardBanner"
                visualType={VisualType.Card}
                flex={1}
                initialVisualUrl={templateVisuals.cardBannerUrl}
              />
            </PageContentBlock>
          </Gutters>
        </Form>
      )}
    </Formik>
  );
};
