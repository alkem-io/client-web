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
import AccountSearchPicker from '../shared/AccountSearchPicker';
import useTransferInnovationHub from './useTransferInnovationHub';

const T_PREFIX = 'pages.admin.transferHub';

const TransferInnovationHubSection = () => {
  const { t } = useTranslation();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState<string | undefined>();

  const { hub, currentAccountName, loading, transferLoading, error, handleResolve, handleTransfer } =
    useTransferInnovationHub();

  const urlValidator = yup.object().shape({
    url: yup.string().required(t(`${T_PREFIX}.urlRequired`)),
  });

  const onSubmit = ({ url }: { url: string }) => {
    handleResolve(url);
    return Promise.resolve();
  };

  const onConfirmTransfer = async () => {
    setConfirmDialogOpen(false);
    if (targetAccountId) {
      await handleTransfer(targetAccountId);
    }
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t(`${T_PREFIX}.sectionTitle`)}</BlockTitle>
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
                <FormikSubmitButtonPure formik={formik}>{t(`${T_PREFIX}.resolve`)}</FormikSubmitButtonPure>
              </Gutters>
            </Form>
          )}
        </Formik>
      </PageContentBlockSeamless>
      {loading && <Loading />}
      {error && <Caption color="error">{t(error)}</Caption>}
      {hub && (
        <PageContentBlock>
          <Gutters row={true} disablePadding={true} alignItems="baseline">
            <BlockSectionTitle>{t(`${T_PREFIX}.hubName`)}</BlockSectionTitle>
            <span>{hub.profile.displayName}</span>
          </Gutters>
          {currentAccountName && (
            <Gutters row={true} disablePadding={true} alignItems="baseline">
              <BlockSectionTitle>{t(`${T_PREFIX}.currentAccount`)}</BlockSectionTitle>
              <span>{currentAccountName}</span>
            </Gutters>
          )}
          <AccountSearchPicker
            label={t(`${T_PREFIX}.targetAccountLabel`)}
            disabled={transferLoading}
            onSelect={setTargetAccountId}
          />
          <Button
            variant="contained"
            onClick={() => setConfirmDialogOpen(true)}
            disabled={!targetAccountId || transferLoading}
          >
            {t(`${T_PREFIX}.transferButton`)}
          </Button>
        </PageContentBlock>
      )}
      <ConfirmationDialog
        entities={{
          title: t(`${T_PREFIX}.confirmTitle`),
          content: t(`${T_PREFIX}.confirmWarning`),
        }}
        actions={{
          onConfirm: onConfirmTransfer,
          onCancel: () => setConfirmDialogOpen(false),
        }}
        options={{ show: confirmDialogOpen }}
        state={{ isLoading: transferLoading }}
      />
    </PageContentBlock>
  );
};

export default TransferInnovationHubSection;
