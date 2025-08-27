import { PropsWithChildren, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { TagsetField } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import {
  SpaceCreationForm,
  SpaceFormValues,
} from '@/domain/space/components/CreateSpace/common/SpaceCreationDialog.models';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import SpaceTemplateSelector from '@/domain/templates/components/TemplateSelectors/SpaceTemplateSelector';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import FormikVisualUpload from '@/core/ui/upload/FormikVisualUpload/FormikVisualUpload';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { EntityVisualUrls } from '@/domain/common/visual/utils/visuals.utils';
import NameIdField from '@/core/utils/nameId/NameIdField';
import { nameOf } from '@/core/utils/nameOf';
import FormikCheckboxField from '@/core/ui/forms/FormikCheckboxField';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption } from '@/core/ui/typography';
import { useConfig } from '@/domain/platform/config/useConfig';
import LinkButton from '@/core/ui/button/LinkButton';
import { nameIdValidator } from '@/core/ui/forms/validator/nameIdValidator';
import { SpaceTemplate } from '@/domain/templates/models/SpaceTemplate';

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
    addTutorialCallouts: yup.boolean(),
    acceptedTerms: yup.boolean().oneOf([true], t('forms.validations.acceptedTerms')),
  });
  const level = SpaceLevel.L0;

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
            name={nameOf<CreateSpaceFormValues>('spaceTemplateId')}
            level={SpaceLevel.L0}
            disablePadding
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
            required
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
            required
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
              <WrapperMarkdown caption>{t('createSpace.terms.dialogContent')}</WrapperMarkdown>
              {config.locations?.terms && (
                <RouterLink to={config.locations?.terms ?? ''} blank underline="always">
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
