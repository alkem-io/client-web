import { DialogContent } from '@mui/material';
import { Form, Formik } from 'formik';
import { type PropsWithChildren, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import LinkButton from '@/core/ui/button/LinkButton';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import FormikCheckboxField from '@/core/ui/forms/FormikCheckboxField';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { nameIdValidator } from '@/core/ui/forms/validator/nameIdValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption } from '@/core/ui/typography';
import FormikVisualUpload from '@/core/ui/upload/FormikVisualUpload/FormikVisualUpload';
import NameIdField from '@/core/utils/nameId/NameIdField';
import { nameOf } from '@/core/utils/nameOf';
import type { EntityVisualUrls } from '@/domain/common/visual/utils/visuals.utils';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TagsetField } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import type {
  SpaceCreationForm,
  SpaceFormValues,
} from '@/domain/space/components/CreateSpace/common/SpaceCreationDialog.models';
import SpaceTemplateSelector from '@/domain/templates/components/TemplateSelectors/SpaceTemplateSelector';
import type { SpaceTemplate } from '@/domain/templates/models/SpaceTemplate';

const FormikEffect = FormikEffectFactory<CreateSpaceFormValues>();

type CreateSpaceFormValues = Required<
  Pick<
    SpaceFormValues,
    | 'displayName'
    | 'nameId'
    | 'tagline'
    | 'description'
    | 'tags'
    | 'addTutorialCallouts'
    | 'addCallouts'
    | 'spaceTemplateId'
    | 'visuals'
    | 'acceptedTerms'
  >
>;

interface CreateSpaceFormProps extends SpaceCreationForm {}

export const CreateSpaceForm = ({
  isSubmitting,
  onValidChanged,
  onChange,
}: PropsWithChildren<CreateSpaceFormProps>) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [templateVisuals, setTemplateVisuals] = useState<EntityVisualUrls>({});
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const config = useConfig();

  const validationRequiredString = t('forms.validations.required');

  const handleTemplateVisualsLoaded = (visuals: EntityVisualUrls) => {
    setTemplateVisuals(visuals);
  };

  const initialValues: CreateSpaceFormValues = {
    displayName: '',
    nameId: '',
    tagline: '',
    description: '',
    tags: [],
    addTutorialCallouts: false,
    addCallouts: true,
    spaceTemplateId: '',
    visuals: {
      banner: { file: undefined, altText: '' },
      cardBanner: { file: undefined, altText: '' },
    },
    acceptedTerms: false,
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
    nameId: nameIdValidator,
    tagline: textLengthValidator({ minLength: 3, maxLength: SMALL_TEXT_LENGTH }),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    tags: yup
      .array()
      .of(textLengthValidator({ minLength: 2 }))
      .notRequired(),
    spaceTemplateId: textLengthValidator().nullable(),
    addTutorialCallouts: yup.boolean(),
    acceptedTerms: yup.boolean().oneOf([true], t('forms.validations.acceptedTerms')),
  });
  const level = SpaceLevel.L0;

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
            name={nameOf<CreateSpaceFormValues>('spaceTemplateId')}
            level={SpaceLevel.L0}
            disablePadding={true}
            sx={{ paddingBottom: gutters() }}
            onTemplateVisualsLoaded={handleTemplateVisualsLoaded}
            isTemplateSelectable={(template: SpaceTemplate) =>
              // Space templates can only be selected if they have a valid innovation flow with 4 states
              template.contentSpace?.collaboration.innovationFlow.states.length === 4
            }
          />
          <FormikInputField
            name={nameOf<CreateSpaceFormValues>('displayName')}
            title={t(`context.${level}.displayName.title`)}
            helperText={t(`context.${level}.displayName.description`)}
            disabled={isSubmitting}
            maxLength={SMALL_TEXT_LENGTH}
          />
          <NameIdField
            name={nameOf<CreateSpaceFormValues>('nameId')}
            sourceFieldName={nameOf<CreateSpaceFormValues>('displayName')}
            title={t('common.url')}
            required={true}
          />
          <FormikInputField
            name={nameOf<CreateSpaceFormValues>('tagline')}
            title={t(`context.${level}.tagline.title`)}
            helperText={t(`context.${level}.tagline.description`)}
            disabled={isSubmitting}
            maxLength={SMALL_TEXT_LENGTH}
          />
          <TagsetField
            name={nameOf<CreateSpaceFormValues>('tags')}
            disabled={isSubmitting}
            title={t(`context.${level}.tags.title`)}
            helperText={t(`context.${level}.tags.description`)}
            helpTextIcon={t(`context.${level}.tags.tooltip`)}
          />
          <PageContentBlock
            sx={{
              flexDirection: isMediumSmallScreen ? 'column' : 'row',
              justifyContent: 'space-between',
              marginTop: gutters(),
            }}
          >
            <FormikVisualUpload
              name={nameOf<CreateSpaceFormValues>('visuals.banner')}
              visualType={VisualType.Banner}
              flex={1}
              initialVisualUrl={templateVisuals.bannerUrl}
            />
            <FormikVisualUpload
              name={nameOf<CreateSpaceFormValues>('visuals.cardBanner')}
              visualType={VisualType.Card}
              flex={1}
              initialVisualUrl={templateVisuals.cardBannerUrl}
            />
          </PageContentBlock>
          <FormikCheckboxField
            name={nameOf<CreateSpaceFormValues>('addTutorialCallouts')}
            label={<Caption>{t('createSpace.addTutorialsLabel')}</Caption>}
            containerProps={{ sx: { marginLeft: gutters(), marginTop: gutters(), width: '100%' } }}
          />
          <FormikCheckboxField
            name={nameOf<CreateSpaceFormValues>('acceptedTerms')}
            required={true}
            label={
              <Caption>
                <Trans
                  i18nKey="createSpace.terms.checkboxLabel"
                  components={{
                    terms: (
                      <LinkButton
                        underline="always"
                        onClick={event => {
                          event.stopPropagation();
                          setIsTermsDialogOpen(true);
                        }}
                      />
                    ),
                  }}
                />
              </Caption>
            }
            containerProps={{ sx: { marginLeft: gutters(), width: '100%' } }}
          />
          <DialogWithGrid
            columns={8}
            open={isTermsDialogOpen}
            onClose={() => setIsTermsDialogOpen(false)}
            aria-labelledby="terms-dialog-title"
          >
            <DialogHeader
              id="terms-dialog-title"
              title={t('createSpace.terms.dialogTitle')}
              onClose={() => setIsTermsDialogOpen(false)}
            />
            <DialogContent sx={{ paddingTop: 0 }}>
              <WrapperMarkdown caption={true}>{t('createSpace.terms.dialogContent')}</WrapperMarkdown>
              {config.locations?.terms && (
                <RouterLink to={config.locations?.terms ?? ''} blank={true} underline="always">
                  <Caption>{t('createSpace.terms.fullTermsLink')}</Caption>
                </RouterLink>
              )}
            </DialogContent>
          </DialogWithGrid>
        </Form>
      )}
    </Formik>
  );
};
