import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import * as yup from 'yup';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import { AiPersonaEngine, AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Formik } from 'formik';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { useMemo } from 'react';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import VisibilityForm from '../components/VisibilityForm';
import BodyOfKnowledgeManagement from '../components/BodyOfKnowledgeManagement';

type FormValueType = {
  prompt: string;
};
const FormikEffect = FormikEffectFactory<FormValueType>();

const PromptConfig = ({ vc }) => {
  const { t } = useTranslation();

  const initialValues: FormValueType = useMemo(
    () => ({
      prompt: '',
    }),
    [vc?.id]
  );

  if (!vc) {
    return null;
  }

  const validationSchema = yup.object().shape({
    prompt: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <BlockTitle>{t('pages.virtualContributorProfile.settings.prompt.title')}</BlockTitle>
          <Caption>{t('pages.virtualContributorProfile.settings.prompt.infoText')}</Caption>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            initialTouched={{
              prompt: initialValues.prompt !== '',
            }}
            enableReinitialize
            validateOnMount
            onSubmit={() => {}}
          >
            <>
              <FormikEffect
                onChange={() => {
                  console.log('change');
                }}
                onStatusChange={() => console.log('status change')}
              />
              <FormikMarkdownField
                name="description"
                title={t('components.callout-creation.info-step.description')}
                rows={7}
                maxLength={MARKDOWN_TEXT_LENGTH}
                temporaryLocation={false}
                hideImageOptions
              />
              <Actions>
                <LoadingButton variant="contained" loading={false} onClick={() => console.log('saving')}>
                  {t('pages.virtualContributorProfile.settings.prompt.saveBtn')}
                </LoadingButton>
              </Actions>
            </>
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default PromptConfig;
