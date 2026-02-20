import { useState } from 'react';
import { Form, Formik } from 'formik';
import Gutters from '@/core/ui/grid/Gutters';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import Loading from '@/core/ui/loading/Loading';
import { Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import * as yup from 'yup';
import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useTransferSpace from './useTransferSpace';

const T_PREFIX = 'pages.admin.transferSpace';

const TransferSpaceSection = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const {
    space,
    accountOwner,
    isL0Space,
    hasSpaceTransferOffer,
    hasAccountTransferAccept,
    spaceLoading,
    ownerLoading,
    transferLoading,
    spaceError,
    ownerError,
    handleSpaceSubmit,
    handleAccountOwnerSubmit,
    handleTransfer,
  } = useTransferSpace();

  const urlValidator = yup.object().shape({
    url: yup.string().required(t(`${T_PREFIX}.urlRequired`)),
  });

  const onSpaceSubmit = ({ url }: { url: string }) => {
    handleSpaceSubmit(url);
    return Promise.resolve();
  };

  const onOwnerSubmit = ({ url }: { url: string }) => {
    handleAccountOwnerSubmit(url);
    return Promise.resolve();
  };

  const onTransfer = async () => {
    try {
      await handleTransfer();
      setSuccessDialogOpen(true);
    } catch {
      notify(t(`${T_PREFIX}.transferFailed`), 'error');
    }
  };

  const canTransfer =
    space && isL0Space && accountOwner?.accountId && hasSpaceTransferOffer && hasAccountTransferAccept;

  return (
    <PageContentBlock>
      <BlockTitle>{t(`${T_PREFIX}.sectionTitle`)}</BlockTitle>
      <Gutters row disablePadding>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding>
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onSpaceSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField
                      name="url"
                      title={t(`${T_PREFIX}.spaceUrl`)}
                      placeholder={t(`${T_PREFIX}.spaceUrlPlaceholder`)}
                      fullWidth
                    />
                    <FormikSubmitButtonPure formik={formik}>{t(`${T_PREFIX}.lookup`)}</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
          {spaceLoading && <Loading />}
          {spaceError && (
            <PageContentBlock>
              <Caption>{t(spaceError)}</Caption>
            </PageContentBlock>
          )}
          {space && isL0Space && (
            <PageContentBlock>
              <BlockTitle>{t(`${T_PREFIX}.spaceInfo`)}</BlockTitle>
              <Gutters disablePadding>
                <BlockSectionTitle>{t('common.name')}</BlockSectionTitle>
                <span>{space.about.profile.displayName}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>{t(`${T_PREFIX}.description`)}</BlockSectionTitle>
                <span>{space.about.profile.description}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>{t(`${T_PREFIX}.level`)}</BlockSectionTitle>
                <span>{space.level}</span>
              </Gutters>
              {hasSpaceTransferOffer === false && (
                <Caption color="error">{t(`${T_PREFIX}.missingTransferOffer`)}</Caption>
              )}
            </PageContentBlock>
          )}
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding>
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onOwnerSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField
                      name="url"
                      title={t(`${T_PREFIX}.targetAccountUrl`)}
                      placeholder={t(`${T_PREFIX}.targetAccountUrlPlaceholder`)}
                      fullWidth
                    />
                    <FormikSubmitButtonPure formik={formik}>{t(`${T_PREFIX}.lookup`)}</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
          {ownerLoading && <Loading />}
          {ownerError && (
            <PageContentBlock>
              <Caption>{t(ownerError)}</Caption>
            </PageContentBlock>
          )}
          {accountOwner?.name && (
            <PageContentBlock>
              <BlockTitle>{t(`${T_PREFIX}.targetAccountInfo`)}</BlockTitle>
              <Gutters disablePadding>
                <BlockSectionTitle>{t(`${T_PREFIX}.accountOwnerType`)}</BlockSectionTitle>
                <span>
                  {accountOwner.type === 'user'
                    ? t(`${T_PREFIX}.accountOwnerTypeUser`)
                    : t(`${T_PREFIX}.accountOwnerTypeOrganization`)}
                </span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>{t('common.name')}</BlockSectionTitle>
                <span>{accountOwner.name}</span>
              </Gutters>
              {accountOwner.accountId && (
                <Gutters disablePadding>
                  <BlockSectionTitle>{t(`${T_PREFIX}.accountId`)}</BlockSectionTitle>
                  <span>{accountOwner.accountId}</span>
                </Gutters>
              )}
              {hasAccountTransferAccept === false && (
                <Caption color="error">{t(`${T_PREFIX}.missingTransferAccept`)}</Caption>
              )}
            </PageContentBlock>
          )}
          {canTransfer && (
            <PageContentBlock>
              <Button variant="contained" onClick={onTransfer} disabled={transferLoading}>
                {transferLoading ? t(`${T_PREFIX}.transferring`) : t(`${T_PREFIX}.transferButton`)}
              </Button>
            </PageContentBlock>
          )}
        </PageContentColumn>
      </Gutters>
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        aria-labelledby="transfer-space-success-title"
      >
        <DialogContent>
          <BlockTitle id="transfer-space-success-title">{t(`${T_PREFIX}.successTitle`)}</BlockTitle>
          <span>
            {t(`${T_PREFIX}.successMessage`, {
              spaceName: space?.about.profile.displayName,
              accountOwnerName: accountOwner?.name,
            })}
          </span>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)}>{t(`${T_PREFIX}.close`)}</Button>
        </DialogActions>
      </Dialog>
    </PageContentBlock>
  );
};

export default TransferSpaceSection;
