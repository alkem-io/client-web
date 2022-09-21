import AddModeratorIcon from '@mui/icons-material/AddModerator';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolvedPath } from 'react-router-dom';
import { CredentialCard } from '../../../../../common/components/composite/common/cards';
import OfferAlkemioCommunityCredentialDialog from '../../../../../common/components/composite/dialogs/CredentialDialog.tsx/OfferAlkemioCommunityCredentialDialog';
import RequestCredentialDialog from '../../../../../common/components/composite/dialogs/CredentialDialog.tsx/RequestCredentialDialog';
import QRCodeDialog from '../../../../../common/components/composite/dialogs/QRCodeDialog/QRCodeDialog';
import { Loading } from '../../../../../common/components/core';
import UserCredentialsContainer from '../../../../../containers/user/UserCredentialsContainer';
import { useNotification, useUpdateNavigation } from '../../../../../hooks';
import { useUserSsiLazyQuery, useProfileVerifiedCredentialSubscription } from '../../../../../hooks/generated/graphql';
import { PageProps } from '../../../../../pages';
import { SettingsSection } from '../../../../platform/admin/layout/EntitySettings/constants';
import UserSettingsLayout from '../../../../platform/admin/user/layout/UserSettingsLayout';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { CardLayoutContainer, CardLayoutItem } from '../../../../shared/layout/CardsLayout/CardsLayout';
import { useUserContext } from '../hooks/useUserContext';

interface UserCredentialsPageProps extends PageProps {}

export const UserCredentialsPage: FC<UserCredentialsPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { pathname: url } = useResolvedPath('.');

  const { user: currentUser, loading: loadingUserContext } = useUserContext();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'profile', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  const [requestCredentialDialogOpen, setRequestCredentialDialogOpen] = useState(false);
  const [communityCredentialOfferDialogOpen, setCommunityCredentialOfferDialogOpen] = useState(false);
  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [jwt, setJWT] = useState<string | null>(null);
  const [refetchUserSsiQuery] = useUserSsiLazyQuery();

  useProfileVerifiedCredentialSubscription({
    shouldResubscribe: true,
    onSubscriptionData: async () => {
      await refetchUserSsiQuery();
      setRequestCredentialDialogOpen(false);
      notify(t('pages.user-credentials.added-successfully'), 'success');
    },
    skip: !requestCredentialDialogOpen,
  });

  if (!currentUser?.user.id) {
    return <Loading />;
  }

  return (
    <UserSettingsLayout currentTab={SettingsSection.Credentials}>
      <UserCredentialsContainer userID={currentUser?.user.id}>
        {({ verifiedCredentials, credentialMetadata }, state, actions) => (
          <Grid container spacing={2}>
            <Grid item xs={12} display="flex" flexDirection="column">
              <DashboardGenericSection
                headerText={t('pages.user-credentials.your-credentials.title')}
                subHeaderText={t('pages.user-credentials.your-credentials.description')}
                primaryAction={
                  <Button
                    startIcon={<AddModeratorIcon />}
                    variant="contained"
                    color="primary"
                    onClick={() => setRequestCredentialDialogOpen(true)}
                  >
                    {t('pages.user-credentials.your-credentials.add-credential')}
                  </Button>
                }
              >
                <CardLayoutContainer>
                  {verifiedCredentials?.map((c, i) => (
                    <CardLayoutItem key={i} flexGrow={1} maxWidth={{ xs: 'auto', sm: 'auto', md: '25%' }}>
                      <CredentialCard
                        entities={{
                          claims: c.claims || [],
                          context: JSON.parse(c.context),
                          issued: c.issued,
                          expires: c.expires,
                          issuer: c.issuer,
                          description: credentialMetadata?.find(cm => cm.uniqueType === c.type)?.description,
                          name: c.name,
                          type: c.type,
                        }}
                        loading={state.getUserCredentialsLoading}
                      />
                    </CardLayoutItem>
                  ))}
                </CardLayoutContainer>
              </DashboardGenericSection>
            </Grid>
            <Grid item xs={12} md={6} display="flex" flexDirection="column">
              <DashboardGenericSection
                headerText={t('components.alkemio-user-credential-offer-dialog.title')}
                subHeaderText={t('components.alkemio-user-credential-offer-dialog.content')}
                primaryAction={
                  <Button
                    onClick={async () => {
                      const response = await actions.generateAlkemioUserCredentialOffer();
                      setJWT(response.jwt);
                      setQRDialogOpen(true);
                    }}
                  >
                    {t('pages.user-credentials.issue')}
                  </Button>
                }
              >
                <Typography variant="body2">Token Structure:</Typography>
                <pre>
                  {(() => {
                    const context =
                      credentialMetadata?.find(metadata => metadata.uniqueType === 'AlkemioMemberCredential')
                        ?.context || '{}';

                    return JSON.stringify(JSON.parse(context), null, 2);
                  })()}
                </pre>
              </DashboardGenericSection>
            </Grid>
            <Grid item xs={12} md={6} display="flex" flexDirection="column">
              <DashboardGenericSection
                headerText={t('components.alkemio-community-member-credential-offer-dialog.title')}
                subHeaderText={t('components.alkemio-community-member-credential-offer-dialog.content')}
                primaryAction={
                  <Button
                    onClick={async () => {
                      setCommunityCredentialOfferDialogOpen(true);
                    }}
                  >
                    {t('pages.user-credentials.issue')}
                  </Button>
                }
              >
                <Typography variant="body2">Token Structure:</Typography>
                <pre>
                  {(() => {
                    const context =
                      credentialMetadata?.find(metadata => metadata.uniqueType === 'CommunityMemberCredential')
                        ?.context || '{}';

                    return JSON.stringify(JSON.parse(context), null, 2);
                  })()}
                </pre>
              </DashboardGenericSection>
            </Grid>
            {/* <ContributionDetailsContainer entities={{ }}></ContributionDetailsContainer> */}
            <RequestCredentialDialog
              actions={{
                onCancel: () => setRequestCredentialDialogOpen(false),
                onGenerate: actions.generateCredentialRequest,
              }}
              entities={{
                credentialMetadata,
                titleId: 'components.credential-share-request-dialog.title',
                content: t('components.credential-share-request-dialog.content'),
              }}
              options={{
                show: requestCredentialDialogOpen,
              }}
              state={{
                isLoadingCredentialMetadata: state.getCredentialMetadataLoading,
                isLoadingToken: state.generateCredentialRequestLoading,
              }}
            />
            <OfferAlkemioCommunityCredentialDialog
              actions={{
                onCancel: () => setCommunityCredentialOfferDialogOpen(false),
                onGenerate: actions.generateCommunityMemberCredentialOffer,
              }}
              entities={{
                titleId: 'components.credential-share-request-dialog.title',
                content: t('components.credential-share-request-dialog.content'),
                contributions: currentUser.contributions,
              }}
              options={{
                show: communityCredentialOfferDialogOpen,
              }}
              state={{
                isLoadingContributions: loadingUserContext,
                isLoadingToken: state.generateCommunityMemberCredentialOfferLoading,
              }}
            />
            <QRCodeDialog
              actions={{
                onCancel: () => setQRDialogOpen(false),
              }}
              entities={{
                qrCodeJwt: jwt || '',
                titleId: 'components.alkemio-user-credential-offer-dialog.title',
                contentId: 'components.alkemio-user-credential-offer-dialog.content',
              }}
              options={{
                show: qrDialogOpen,
              }}
              state={{
                isLoading:
                  state.generateCommunityMemberCredentialOfferLoading ||
                  state.generateAlkemioUserCredentialOfferLoading,
              }}
            />
          </Grid>
        )}
      </UserCredentialsContainer>
    </UserSettingsLayout>
  );
};

export default UserCredentialsPage;
