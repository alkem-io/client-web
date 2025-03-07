import AddModeratorIcon from '@mui/icons-material/AddModerator';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CredentialCard from '@/domain/agent/credential/CredentialCard';
import OfferAlkemioCommunityCredentialDialog from '@/domain/agent/credential/OfferAlkemioCommunityCredentialDialog';
import RequestCredentialDialog from '@/domain/agent/credential/RequestCredentialDialog';
import QRCodeDialog from '@/core/ui/qrCode/QRCodeDialog';
import Loading from '@/core/ui/loading/Loading';
import UserCredentialsContainer from '@/domain/agent/credential/verifiedCredentials/UserCredentialsContainer';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useProfileVerifiedCredentialSubscription, useUserSsiLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import DashboardGenericSection from '@/domain/shared/components/DashboardSections/DashboardGenericSection';
import { CardLayoutContainer, CardLayoutItem } from '@/core/ui/card/cardsLayout/CardsLayout';
import { useUserContext } from '../../user/hooks/useUserContext';
import useUserContributions from '../../user/userContributions/useUserContributions';

export const UserAdminCredentialsPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { user: currentUser, loading: loadingUserContext } = useUserContext();

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

  const contributions = useUserContributions(currentUser?.user.id);

  if (!currentUser?.user.id) {
    return <Loading />;
  }

  return (
    <UserAdminLayout currentTab={SettingsSection.Credentials}>
      <UserCredentialsContainer userID={currentUser?.user.id}>
        {({ entities: { verifiedCredentials, credentialMetadata }, state, actions }) => (
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
                contributions: contributions ?? [],
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
    </UserAdminLayout>
  );
};

export default UserAdminCredentialsPage;
