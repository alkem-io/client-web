import { PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { TagsetField } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import {
  SpaceCreationForm,
  SpaceFormValues,
} from '@/domain/space/components/CreateSpace/common/SpaceCreationDialog.models';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import SpaceTemplateSelector from '@/domain/templates/components/TemplateSelectors/SpaceTemplateSelector';
import Gutters from '@/core/ui/grid/Gutters';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import FormikVisualUpload from '@/core/ui/upload/FormikVisualUpload/FormikVisualUpload';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { EntityVisualUrls } from '@/domain/common/visual/utils/visuals.utils';
import { nameOf } from '@/core/utils/nameOf';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

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
          <FormikEffect onChange={onChange} onStatusChange={onValidChanged} />
          <SpaceTemplateSelector
            name={nameOf<CreateSubspaceFormValues>('spaceTemplateId')}
            level={level}
            disablePadding
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
            temporaryLocation
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
