import { PropsWithChildren, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { TranslatedValidatedMessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { TagsetField } from '@/domain/platform/admin/components/Common/TagsetSegment';
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

const FormikEffect = FormikEffectFactory<CreateSpaceFormValues>();

type CreateSpaceFormValues = Required<
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
    | 'acceptedTerms'
  >
>;

interface CreateSpaceFormProps extends SpaceCreationForm {}

export const CreateSpaceForm = ({
  isSubmitting,
  onValidChanged,
  onChanged,
}: PropsWithChildren<CreateSpaceFormProps>) => {
  const { t } = useTranslation();
  const { isMediumSmallScreen } = useScreenSize();
  const [templateVisuals, setTemplateVisuals] = useState<EntityVisualUrls>({});
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const config = useConfig();

  const validationRequiredString = t('forms.validations.required');

  const handleChanged = (value: CreateSpaceFormValues) =>
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

  const initialValues: CreateSpaceFormValues = {
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
          <FormikEffect onChange={handleChanged} onStatusChange={onValidChanged} />
          <SpaceTemplateSelector
            name={nameOf<CreateSpaceFormValues>('spaceTemplateId')}
            level={SpaceLevel.L0}
            disablePadding
            sx={{ paddingBottom: gutters() }}
            onTemplateVisualsLoaded={handleTemplateVisualsLoaded}
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
          <Gutters padding={theme => `${gutters()(theme)} 0 0 0`}>
            <PageContentBlock
              sx={{ flexDirection: isMediumSmallScreen ? 'column' : 'row', justifyContent: 'space-between' }}
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
          </Gutters>
          <FormikCheckboxField
            name={nameOf<CreateSpaceFormValues>('acceptedTerms')}
            required
            title="createSpace.terms.checkboxLabel"
            label={
              <Caption display="inline">
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
            containerProps={{ sx: { margin: gutters() } }}
          />
          <DialogWithGrid columns={8} open={isTermsDialogOpen} onClose={() => setIsTermsDialogOpen(false)}>
            <DialogHeader title={t('createSpace.terms.dialogTitle')} onClose={() => setIsTermsDialogOpen(false)} />
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
