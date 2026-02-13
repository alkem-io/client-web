import { useState } from 'react';
import {
  useCalloutLookupQuery,
  useSpaceCalloutsSetLookupQuery,
  useTransferCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AdminSection, adminTabs } from '@/domain/platformAdmin/layout/toplevel/constants';
import { Form, Formik } from 'formik';
import Gutters from '@/core/ui/grid/Gutters';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { FormikSubmitButtonPure } from '@/domain/shared/components/forms/FormikSubmitButton';
import Loading from '@/core/ui/loading/Loading';
import { Button } from '@mui/material';
import * as yup from 'yup';
import { BlockSectionTitle, BlockTitle } from '@/core/ui/typography';
import SpacePageBanner from '@/domain/space/layout/tabbedLayout/layout/SpacePageBanner';
import HeaderNavigationTabs from '@/domain/shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '@/domain/shared/components/PageHeader/HeaderNavigationTab';
import AdminBreadcrumbs from '@/main/admin/AdminBreadcrumbs';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { useNotification } from '@/core/ui/notifications/useNotification';

const currentTab = AdminSection.TransferCallout;

const TransferCalloutPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [calloutId, setCalloutId] = useState<string>('');
  const [spaceId, setSpaceId] = useState<string>('');

  const { data: calloutData, loading: calloutLoading } = useCalloutLookupQuery({
    variables: { calloutId },
    skip: !calloutId,
  });

  const { data: spaceData, loading: spaceLoading } = useSpaceCalloutsSetLookupQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const [transferCallout, { loading: transferLoading }] = useTransferCalloutMutation();

  const callout = calloutData?.lookup.callout;
  const space = spaceData?.lookup.space;
  const calloutsSetId = space?.collaboration?.calloutsSet?.id;

  const handleCalloutSubmit = ({ calloutId }: { calloutId: string }) => {
    setCalloutId(calloutId);
    return Promise.resolve();
  };

  const handleSpaceSubmit = ({ spaceId }: { spaceId: string }) => {
    setSpaceId(spaceId);
    return Promise.resolve();
  };

  const handleTransfer = async () => {
    if (!callout?.id || !calloutsSetId) return;
    try {
      await transferCallout({
        variables: { calloutId: callout.id, targetCalloutsSetId: calloutsSetId },
      });
      notify('Callout transferred successfully', 'success');
    } catch (error) {
      notify('Failed to transfer callout', 'error');
    }
  };

  const validator = yup.object().shape({
    calloutId: textLengthValidator({ required: true }),
  });

  const spaceValidator = yup.object().shape({
    spaceId: textLengthValidator({ required: true }),
  });

  return (
    <TopLevelLayout
      header={
        <>
          <SpacePageBanner title={t('common.administration')} isAdmin />
          <HeaderNavigationTabs value={currentTab} defaultTab={AdminSection.Space}>
            {adminTabs.map(tab => (
              <HeaderNavigationTab
                key={tab.route}
                label={t(`common.${tab.section}` as const)}
                value={tab.section}
                to={tab.route}
              />
            ))}
          </HeaderNavigationTabs>
        </>
      }
      breadcrumbs={<AdminBreadcrumbs />}
    >
      <PageContent>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding>
            <Formik initialValues={{ calloutId: '' }} validator={validator} onSubmit={handleCalloutSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField name="calloutId" title="Callout ID" fullWidth />
                    <FormikSubmitButtonPure formik={formik}>Lookup Callout</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
          {calloutLoading && <Loading />}
          {callout && (
            <PageContentBlock>
              <BlockTitle>Callout Info</BlockTitle>
              <Gutters disablePadding>
                <BlockSectionTitle>Name</BlockSectionTitle>
                <span>{callout.framing.profile.displayName}</span>
              </Gutters>
              {callout.framing.profile.description && (
                <Gutters disablePadding>
                  <BlockSectionTitle>Description</BlockSectionTitle>
                  <span>{callout.framing.profile.description}</span>
                </Gutters>
              )}
              <Gutters disablePadding>
                <BlockSectionTitle>Activity</BlockSectionTitle>
                <span>{callout.activity}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>Created Date</BlockSectionTitle>
                <span>{String(callout.createdDate)}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>Name ID</BlockSectionTitle>
                <span>{callout.nameID}</span>
              </Gutters>
            </PageContentBlock>
          )}
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding>
            <Formik initialValues={{ spaceId: '' }} validator={spaceValidator} onSubmit={handleSpaceSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField name="spaceId" title="Target Space ID" fullWidth />
                    <FormikSubmitButtonPure formik={formik}>Lookup Space</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
          {spaceLoading && <Loading />}
          {space && (
            <PageContentBlock>
              <BlockTitle>Target Space Info</BlockTitle>
              <Gutters disablePadding>
                <BlockSectionTitle>Name</BlockSectionTitle>
                <span>{space.about.profile.displayName}</span>
              </Gutters>
              <Gutters disablePadding>
                <BlockSectionTitle>Level</BlockSectionTitle>
                <span>{space.level}</span>
              </Gutters>
              {calloutsSetId && (
                <Gutters disablePadding>
                  <BlockSectionTitle>CalloutsSet ID</BlockSectionTitle>
                  <span>{calloutsSetId}</span>
                </Gutters>
              )}
            </PageContentBlock>
          )}
          {callout && calloutsSetId && (
            <PageContentBlock>
              <Button variant="contained" onClick={handleTransfer} disabled={transferLoading}>
                {transferLoading ? 'Transferring...' : 'Transfer Callout'}
              </Button>
            </PageContentBlock>
          )}
        </PageContentColumn>
      </PageContent>
    </TopLevelLayout>
  );
};

export default TransferCalloutPage;
