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
import useTransferCallout from './useTransferCallout';

const T_PREFIX = 'pages.admin.transferCallout';

const TransferCalloutSection = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const {
    callout,
    space,
    calloutsSetId,
    hasTransferOffer,
    hasTransferAccept,
    calloutLoading,
    spaceLoading,
    transferLoading,
    calloutError,
    spaceError,
    handleCalloutSubmit,
    handleSpaceSubmit,
    handleTransfer,
  } = useTransferCallout();

  const urlValidator = yup.object().shape({
    url: yup.string().required(t(`${T_PREFIX}.urlRequired`)),
  });

  const onCalloutSubmit = ({ url }: { url: string }) => {
    handleCalloutSubmit(url);
    return Promise.resolve();
  };

  const onSpaceSubmit = ({ url }: { url: string }) => {
    handleSpaceSubmit(url);
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

  return (
    <PageContentBlock>
      <BlockTitle>{t(`${T_PREFIX}.sectionTitle`)}</BlockTitle>
      <Gutters row disablePadding>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding>
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onCalloutSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField
                      name="url"
                      title={t(`${T_PREFIX}.calloutUrl`)}
                      placeholder={t(`${T_PREFIX}.calloutUrlPlaceholder`)}
                      fullWidth
                    />
                    <FormikSubmitButtonPure formik={formik}>{t(`${T_PREFIX}.lookup`)}</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
          {calloutLoading && <Loading />}
          {calloutError && (
            <PageContentBlock>
              <Caption>{t(calloutError)}</Caption>
            </PageContentBlock>
          )}
          {callout && (
            <PageContentBlock>
              <BlockTitle>{t(`${T_PREFIX}.calloutInfo`)}</BlockTitle>
              <Gutters disablePadding>
                <BlockSectionTitle>{t('common.name')}</BlockSectionTitle>
                <span>{callout.framing.profile.displayName}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>{t(`${T_PREFIX}.description`)}</BlockSectionTitle>
                <span>{callout.framing.profile.description}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>{t(`${T_PREFIX}.createdBy`)}</BlockSectionTitle>
                <span>{callout.createdBy?.profile.displayName ?? t(`${T_PREFIX}.unknown`)}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>{t(`${T_PREFIX}.contributions`)}</BlockSectionTitle>
                <span>
                  {t(`${T_PREFIX}.contributionsSummary`, {
                    posts: callout.contributionsCount.post,
                    whiteboards: callout.contributionsCount.whiteboard,
                    links: callout.contributionsCount.link,
                    memos: callout.contributionsCount.memo,
                  })}
                </span>
              </Gutters>
              {hasTransferOffer === false && (
                <Caption color="error">{t(`${T_PREFIX}.missingTransferOffer`)}</Caption>
              )}
            </PageContentBlock>
          )}
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding>
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onSpaceSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField
                      name="url"
                      title={t(`${T_PREFIX}.targetSpaceUrl`)}
                      placeholder={t(`${T_PREFIX}.targetSpaceUrlPlaceholder`)}
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
          {space && (
            <PageContentBlock>
              <BlockTitle>{t(`${T_PREFIX}.targetSpaceInfo`)}</BlockTitle>
              <Gutters disablePadding>
                <BlockSectionTitle>{t('common.name')}</BlockSectionTitle>
                <span>{space.about.profile.displayName}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>{t(`${T_PREFIX}.level`)}</BlockSectionTitle>
                <span>{space.level}</span>
              </Gutters>
              {calloutsSetId && (
                <Gutters disablePadding>
                  <BlockSectionTitle>{t(`${T_PREFIX}.calloutsSetId`)}</BlockSectionTitle>
                  <span>{calloutsSetId}</span>
                </Gutters>
              )}
              {hasTransferAccept === false && (
                <Caption color="error">{t(`${T_PREFIX}.missingTransferAccept`)}</Caption>
              )}
            </PageContentBlock>
          )}
          {callout && calloutsSetId && (
            <PageContentBlock>
              <Button
                variant="contained"
                onClick={onTransfer}
                disabled={transferLoading || !hasTransferOffer || !hasTransferAccept}
              >
                {transferLoading ? t(`${T_PREFIX}.transferring`) : t(`${T_PREFIX}.transferButton`)}
              </Button>
            </PageContentBlock>
          )}
        </PageContentColumn>
      </Gutters>
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} aria-labelledby="transfer-callout-success-title">
        <DialogContent>
          <BlockTitle id="transfer-callout-success-title">{t(`${T_PREFIX}.successTitle`)}</BlockTitle>
          <span>
            {t(`${T_PREFIX}.successMessage`, {
              calloutName: callout?.framing.profile.displayName,
              spaceName: space?.about.profile.displayName,
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

export default TransferCalloutSection;
