import { useState } from 'react';
import {
  useCalloutUrlResolveQuery,
  useCalloutLookupQuery,
  useSpaceUrlResolveQuery,
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
import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
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
import { useNotification } from '@/core/ui/notifications/useNotification';
import { AuthorizationPrivilege, UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';

const currentTab = AdminSection.TransferCallout;

const toFullUrl = (input: string): string => {
  try {
    new URL(input);
    return input;
  } catch {
    const path = input.startsWith('/') ? input : `/${input}`;
    return `${globalThis.location.origin}${path}`;
  }
};

const urlValidator = yup.object().shape({
  url: yup.string().required('URL is required'),
});

const TransferCalloutPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();

  const [calloutUrl, setCalloutUrl] = useState('');
  const [spaceUrl, setSpaceUrl] = useState('');

  // Step 1: Resolve callout URL to get callout ID
  const { data: calloutResolveData, loading: calloutResolveLoading } = useCalloutUrlResolveQuery({
    variables: { url: calloutUrl },
    skip: !calloutUrl,
  });

  const calloutResolved = calloutResolveData?.urlResolver;
  const resolvedCalloutId = calloutResolved?.space?.collaboration?.calloutsSet?.calloutId;

  // Step 2: Fetch callout details using resolved ID
  const { data: calloutData, loading: calloutLoading } = useCalloutLookupQuery({
    variables: { calloutId: resolvedCalloutId! },
    skip: !resolvedCalloutId,
  });

  const callout = calloutData?.lookup.callout;
  const hasTransferOffer = callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.TransferResourceOffer);

  // Step 1: Resolve space URL to get space ID
  const { data: spaceResolveData, loading: spaceResolveLoading } = useSpaceUrlResolveQuery({
    variables: { url: spaceUrl },
    skip: !spaceUrl,
  });

  const spaceResolved = spaceResolveData?.urlResolver;
  const resolvedSpaceId = spaceResolved?.space?.id;

  // Step 2: Fetch space details using resolved ID
  const { data: spaceData, loading: spaceLoading } = useSpaceCalloutsSetLookupQuery({
    variables: { spaceId: resolvedSpaceId! },
    skip: !resolvedSpaceId,
  });

  const space = spaceData?.lookup.space;
  const calloutsSetId = space?.collaboration?.calloutsSet?.id;
  const hasTransferAccept = space?.collaboration?.calloutsSet?.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.TransferResourceAccept
  );

  const [transferCallout, { loading: transferLoading }] = useTransferCalloutMutation();

  const handleCalloutSubmit = ({ url }: { url: string }) => {
    setCalloutUrl(toFullUrl(url));
    return Promise.resolve();
  };

  const handleSpaceSubmit = ({ url }: { url: string }) => {
    setSpaceUrl(toFullUrl(url));
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

  const calloutError =
    calloutResolved?.state === UrlResolverResultState.NotFound
      ? 'URL not found'
      : calloutResolved && !resolvedCalloutId
        ? 'URL does not resolve to a callout'
        : undefined;

  const spaceError =
    spaceResolved?.state === UrlResolverResultState.NotFound
      ? 'URL not found'
      : spaceResolved && !resolvedSpaceId
        ? 'URL does not resolve to a space'
        : undefined;

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
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={handleCalloutSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField name="url" title="Callout URL" placeholder="Paste callout URL or path" fullWidth />
                    <FormikSubmitButtonPure formik={formik}>Lookup</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
          {(calloutResolveLoading || calloutLoading) && <Loading />}
          {calloutError && (
            <PageContentBlock>
              <Caption>{calloutError}</Caption>
            </PageContentBlock>
          )}
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
              {hasTransferOffer === false && (
                <Caption color="error">Missing TransferResourceOffer privilege on this callout</Caption>
              )}
            </PageContentBlock>
          )}
        </PageContentColumn>
        <PageContentColumn columns={6}>
          <PageContentBlockSeamless disablePadding>
            <Formik initialValues={{ url: '' }} validationSchema={urlValidator} onSubmit={handleSpaceSubmit}>
              {formik => (
                <Form>
                  <Gutters row disablePadding>
                    <FormikInputField name="url" title="Target Space URL" placeholder="Paste space URL or path" fullWidth />
                    <FormikSubmitButtonPure formik={formik}>Lookup</FormikSubmitButtonPure>
                  </Gutters>
                </Form>
              )}
            </Formik>
          </PageContentBlockSeamless>
          {(spaceResolveLoading || spaceLoading) && <Loading />}
          {spaceError && (
            <PageContentBlock>
              <Caption>{spaceError}</Caption>
            </PageContentBlock>
          )}
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
              {hasTransferAccept === false && (
                <Caption color="error">Missing TransferResourceAccept privilege on target calloutsSet</Caption>
              )}
            </PageContentBlock>
          )}
          {callout && calloutsSetId && (
            <PageContentBlock>
              <Button
                variant="contained"
                onClick={handleTransfer}
                disabled={transferLoading || !hasTransferOffer || !hasTransferAccept}
              >
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
