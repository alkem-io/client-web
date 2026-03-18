import { Form, Formik } from 'formik';
import { type PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import FormikVisualUpload from '@/core/ui/upload/FormikVisualUpload/FormikVisualUpload';
import { nameOf } from '@/core/utils/nameOf';
import type { EntityVisualUrls } from '@/domain/common/visual/utils/visuals.utils';
import { TagsetField } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import type {
  SpaceCreationForm,
  SpaceFormValues,
} from '@/domain/space/components/CreateSpace/common/SpaceCreationDialog.models';
import SpaceTemplateSelector from '@/domain/templates/components/TemplateSelectors/SpaceTemplateSelector';

const FormikEffect = FormikEffectFactory<CreateSubspaceFormValues>();

type CreateSubspaceFormValues = Required<
  Pick<
    SpaceFormValues,
    | 'displayName'
    | 'tagline'
    | 'description'
    | 'tags'
    | 'addTutorialCallouts'
    | 'addCallouts'
    | 'spaceTemplateId'
    | 'visuals'
  >
>;

interface CreateSubspaceFormProps extends SpaceCreationForm {}

export const CreateSubspaceForm = ({
  isSubmitting,
  onValidChanged,
  onChange,
}: PropsWithChildren<CreateSubspaceFormProps>) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [templateVisuals, setTemplateVisuals] = useState<EntityVisualUrls>({});

  const validationRequiredString = t('forms.validations.required');

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
    spaceTemplateId: '',
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
    tagline: textLengthValidator({ minLength: 3, maxLength: SMALL_TEXT_LENGTH }),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    tags: yup
      .array()
      .of(textLengthValidator({ minLength: 2 }))
      .notRequired(),
    spaceTemplateId: textLengthValidator().nullable(),
  });
  const level = SpaceLevel.L1;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      validateOnMount={true}
      onSubmit={() => {}}
    >
      {() => (
        <Form noValidate={true}>
          <FormikEffect onChange={onChange} onStatusChange={onValidChanged} />
          <SpaceTemplateSelector
            name={nameOf<CreateSubspaceFormValues>('spaceTemplateId')}
            level={level}
            disablePadding={true}
            sx={{ paddingBottom: gutters() }}
            onTemplateVisualsLoaded={handleTemplateVisualsLoaded}
          />
          <FormikInputField
            name={nameOf<CreateSubspaceFormValues>('displayName')}
            title={t(`context.${level}.displayName.title`)}
            helperText={t(`context.${level}.displayName.description`)}
            disabled={isSubmitting}
            maxLength={SMALL_TEXT_LENGTH}
          />
          <FormikInputField
            name={nameOf<CreateSubspaceFormValues>('tagline')}
            title={t(`context.${level}.tagline.title`)}
            helperText={t(`context.${level}.tagline.description`)}
            disabled={isSubmitting}
            maxLength={SMALL_TEXT_LENGTH}
          />
          <FormikMarkdownField
            name={nameOf<CreateSubspaceFormValues>('description')}
            title={t(`context.${level}.description.title`)}
            rows={5}
            helperText={t(`context.${level}.description.description`)}
            disabled={isSubmitting}
            maxLength={MARKDOWN_TEXT_LENGTH}
            temporaryLocation={true}
          />
          <TagsetField
            name={nameOf<CreateSubspaceFormValues>('tags')}
            disabled={isSubmitting}
            title={t(`context.${level}.tags.title`)}
            helperText={t(`context.${level}.tags.description`)}
            helpTextIcon={t(`context.${level}.tags.tooltip`)}
          />
          <Gutters padding={theme => `${gutters()(theme)} 0 0 0`}>
            <PageContentBlock
              sx={{ flexDirection: isMediumSmallScreen ? 'column' : 'row', justifyContent: 'space-between' }}
            >
              <FormikVisualUpload
                name={nameOf<CreateSubspaceFormValues>('visuals.avatar')}
                visualType={VisualType.Avatar}
                flex={1}
                initialVisualUrl={templateVisuals.avatarUrl}
              />
              <FormikVisualUpload
                name={nameOf<CreateSubspaceFormValues>('visuals.cardBanner')}
                altText={nameOf<CreateSubspaceFormValues>('visuals.cardBanner.altText')}
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
