import { Button } from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import useVcConversion from './useVcConversion';

const T_PREFIX = 'pages.admin.vcConversion';

const VcConversionSection = () => {
  const { t } = useTranslation();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const {
    vc,
    bodyOfKnowledgeType,
    isSpaceBased,
    isAlreadyConverted,
    sourceSpaceName,
    calloutCount,
    spaceLoading,
    loading,
    convertLoading,
    error,
    handleResolve,
    handleConvert,
  } = useVcConversion();

  const urlValidator = yup.object().shape({
    url: yup.string().required(t(`${T_PREFIX}.urlRequired`)),
  });

  const onSubmit = ({ url }: { url: string }) => {
    handleResolve(url);
    return Promise.resolve();
  };

  const onConfirmConvert = async () => {
    setConfirmDialogOpen(false);
    await handleConvert();
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t(`${T_PREFIX}.sectionTitle`)}</BlockTitle>
      <Caption>{t(`${T_PREFIX}.sectionDescription`)}</Caption>
      <PageContentBlockSeamless disablePadding={true}>
        <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onSubmit}>
          {formik => (
            <Form>
              <Gutters row={true} disablePadding={true}>
                <FormikInputField
                  name="url"
                  title={t(`${T_PREFIX}.sectionTitle`)}
                  placeholder={t(`${T_PREFIX}.urlPlaceholder`)}
                  fullWidth={true}
                />
                <FormikSubmitButtonPure formik={formik}>{t('common.search')}</FormikSubmitButtonPure>
              </Gutters>
            </Form>
          )}
        </Formik>
      </PageContentBlockSeamless>
      {loading && <Loading />}
      {error && <Caption color="error">{t(error)}</Caption>}
      {vc && (
        <PageContentBlock>
          <Gutters row={true} disablePadding={true} alignItems="baseline">
            <BlockSectionTitle>{t(`${T_PREFIX}.vcName`)}</BlockSectionTitle>
            <span>{vc.profile?.displayName}</span>
          </Gutters>
          <Gutters row={true} disablePadding={true} alignItems="baseline">
            <BlockSectionTitle>{t(`${T_PREFIX}.vcType`)}</BlockSectionTitle>
            <span>{bodyOfKnowledgeType}</span>
          </Gutters>
          {isSpaceBased && sourceSpaceName && (
            <>
              <Gutters row={true} disablePadding={true} alignItems="baseline">
                <BlockSectionTitle>{t(`${T_PREFIX}.sourceSpace`)}</BlockSectionTitle>
                <span>{sourceSpaceName}</span>
              </Gutters>
              {!spaceLoading && (
                <Gutters row={true} disablePadding={true} alignItems="baseline">
                  <BlockSectionTitle>{t(`${T_PREFIX}.calloutCount`)}</BlockSectionTitle>
                  <span>{calloutCount}</span>
                </Gutters>
              )}
            </>
          )}
          {isAlreadyConverted && <Caption>{t(`${T_PREFIX}.alreadyConverted`)}</Caption>}
          {isSpaceBased && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setConfirmDialogOpen(true)}
              disabled={convertLoading || spaceLoading}
            >
              {t(`${T_PREFIX}.convertButton`)}
            </Button>
          )}
        </PageContentBlock>
      )}
      <ConfirmationDialog
        entities={{
          title: t(`${T_PREFIX}.confirmTitle`),
          content: t(`${T_PREFIX}.confirmWarning`),
        }}
        actions={{
          onConfirm: onConfirmConvert,
          onCancel: () => setConfirmDialogOpen(false),
        }}
        options={{ show: confirmDialogOpen }}
        state={{ isLoading: convertLoading }}
      />
    </PageContentBlock>
  );
};

export default VcConversionSection;
