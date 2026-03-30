import { Button } from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import useTransferCallout from './useTransferCallout';

const T_PREFIX = 'pages.admin.transferCallout';

const TransferCalloutSection = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

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

  const onTransfer = () => {
    setConfirmDialogOpen(true);
  };

  const onConfirmTransfer = async () => {
    setConfirmDialogOpen(false);
    try {
      await handleTransfer();
      notify(
        t(`${T_PREFIX}.successMessage`, {
          calloutName: callout?.framing.profile.displayName,
          spaceName: space?.about.profile.displayName,
        }),
        'success'
      );
    } catch {
      notify(t(`${T_PREFIX}.transferFailed`), 'error');
    }
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t(`${T_PREFIX}.sectionTitle`)}</BlockTitle>
      <Caption>{t(`${T_PREFIX}.sectionDescription`)}</Caption>
      <Gutters row={true} disablePadding={true}>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding={true}>
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onCalloutSubmit}>
              {formik => (
                <Form>
                  <Gutters row={true} disablePadding={true}>
                    <FormikInputField
                      name="url"
                      title={t(`${T_PREFIX}.calloutUrl`)}
                      placeholder={t(`${T_PREFIX}.calloutUrlPlaceholder`)}
                      fullWidth={true}
                    />
                    <FormikSubmitButtonPure formik={formik}>{t('common.search')}</FormikSubmitButtonPure>
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
              <Gutters row={true} disablePadding={true} alignItems="baseline">
                <BlockSectionTitle>{t('common.name')}</BlockSectionTitle>
                <span>{callout.framing.profile.displayName}</span>
              </Gutters>
              <Gutters row={true} disablePadding={true} alignItems="baseline">
                <BlockSectionTitle>{t(`${T_PREFIX}.description`)}</BlockSectionTitle>
                <span>{callout.framing.profile.description}</span>
              </Gutters>
              <Gutters row={true} disablePadding={true} alignItems="baseline">
                <BlockSectionTitle>{t(`${T_PREFIX}.createdBy`)}</BlockSectionTitle>
                <span>{callout.createdBy?.profile?.displayName ?? t(`${T_PREFIX}.unknown`)}</span>
              </Gutters>
              <Gutters row={true} disablePadding={true} alignItems="baseline">
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
              {hasTransferOffer === false && <Caption color="error">{t(`${T_PREFIX}.missingTransferOffer`)}</Caption>}
            </PageContentBlock>
          )}
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding={true}>
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={onSpaceSubmit}>
              {formik => (
                <Form>
                  <Gutters row={true} disablePadding={true}>
                    <FormikInputField
                      name="url"
                      title={t(`${T_PREFIX}.targetSpaceUrl`)}
                      placeholder={t(`${T_PREFIX}.targetSpaceUrlPlaceholder`)}
                      fullWidth={true}
                    />
                    <FormikSubmitButtonPure formik={formik}>{t('common.search')}</FormikSubmitButtonPure>
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
              <Gutters row={true} disablePadding={true} alignItems="baseline">
                <BlockSectionTitle>{t('common.name')}</BlockSectionTitle>
                <span>{space.about.profile.displayName}</span>
              </Gutters>
              <Gutters row={true} disablePadding={true} alignItems="baseline">
                <BlockSectionTitle>{t(`${T_PREFIX}.level`)}</BlockSectionTitle>
                <span>{space.level}</span>
              </Gutters>
              {calloutsSetId && (
                <Gutters row={true} disablePadding={true} alignItems="baseline">
                  <BlockSectionTitle>{t(`${T_PREFIX}.calloutsSetId`)}</BlockSectionTitle>
                  <span>{calloutsSetId}</span>
                </Gutters>
              )}
              {hasTransferAccept === false && <Caption color="error">{t(`${T_PREFIX}.missingTransferAccept`)}</Caption>}
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
      <ConfirmationDialog
        entities={{
          title: t(`${T_PREFIX}.confirmTitle`),
          content: (
            <ul>
              <li>{t(`${T_PREFIX}.confirmWarning1`)}</li>
              <li>{t(`${T_PREFIX}.confirmWarning2`)}</li>
              <li>{t(`${T_PREFIX}.confirmWarning3`)}</li>
              <li>{t(`${T_PREFIX}.confirmWarning4`)}</li>
            </ul>
          ),
          confirmButtonText: t(`${T_PREFIX}.confirmButton`),
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

export default TransferCalloutSection;
