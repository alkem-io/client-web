import AddModeratorIcon from '@mui/icons-material/AddModerator';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResolvedPath } from 'react-router-dom';
import CredentialCard from '../../components/composite/common/cards/CredentialCard/CredentialCard';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import OfferAlkemioCommunityCredentialDialog from '../../components/composite/dialogs/CredentialDialog.tsx/OfferAlkemioCommunityCredentialDialog';
import RequestCredentialDialog from '../../components/composite/dialogs/CredentialDialog.tsx/RequestCredentialDialog';
import QRCodeDialog from '../../components/composite/dialogs/QRCodeDialog/QRCodeDialog';
import { Loading } from '../../components/core';
import { CardLayoutContainer, CardLayoutItem } from '../../components/core/CardLayoutContainer/CardLayoutContainer';
import UserCredentialsContainer from '../../containers/user/UserCredentialsContainer';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import { PageProps } from '../common';

interface UserCredentialsPageProps extends PageProps {}

export const UserCredentialsPage: FC<UserCredentialsPageProps> = ({ paths }) => {
  const { t } = useTranslation();
  const { pathname: url } = useResolvedPath('.');

  const { user: currentUser, loading: loadingUserContext } = useUserContext();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'profile', real: true }], [url, paths]);
  useUpdateNavigation({ currentPaths });

  const [requestCredentialDialogOpen, setRequestCredentialDialogOpen] = useState(false);
  const [communityCredentialOfferDialogOpen, setCommunityCredentialOfferDialogOpen] = useState(false);
  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [jwt, setJWT] = useState<string | null>(null);

  if (!currentUser?.user.id) {
    return <Loading />;
  }

  return (
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
                  <CardLayoutItem key={i} css={{ flexGrow: 1 }} maxWidth={{ xs: 'auto', sm: 'auto', md: '25%' }}>
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
                  Issue
                </Button>
              }
            >
              <Typography variant="body2">Token Structure:</Typography>
              <pre>
                {(() => {
                  const context =
                    credentialMetadata?.find(metadata => metadata.uniqueType === 'AlkemioMemberCredential')?.context ||
                    '{}';

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
                  Issue
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
              qrValue: jwt,
              titleId: 'components.alkemio-user-credential-offer-dialog.title',
              contentId: 'components.alkemio-user-credential-offer-dialog.content',
            }}
            options={{
              show: qrDialogOpen,
            }}
            state={{
              isLoading:
                state.generateCommunityMemberCredentialOfferLoading || state.generateAlkemioUserCredentialOfferLoading,
            }}
          />
        </Grid>
      )}
    </UserCredentialsContainer>
  );
};

export default UserCredentialsPage;
