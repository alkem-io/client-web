import { Grid, Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CONTRIBUTION_CARD_HEIGHT_SPACING,
  CONTRIBUTION_CARD_WIDTH_SPACING,
  CredentialCard,
} from '../../components/composite/common/cards';
import ProfileCard, { ProfileCardProps } from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import { CardLayoutContainer, CardLayoutItem } from '../../components/core/CardLayoutContainer/CardLayoutContainer';
import UserCredentialsContainer from '../../containers/user/UserCredentialsContainer';
import { VerifiedCredential } from '../../models/graphql-schema';

export interface CredentialsViewProps extends ProfileCardProps {
  userID: string;
  credentials: VerifiedCredential[];
  loading?: boolean;
}

const SkeletonItem = () => (
  <Grid item>
    <Skeleton
      variant="rectangular"
      sx={{
        height: theme => theme.spacing(CONTRIBUTION_CARD_HEIGHT_SPACING / 2),
        width: theme => theme.spacing(CONTRIBUTION_CARD_WIDTH_SPACING),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(CONTRIBUTION_CARD_WIDTH_SPACING),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(CONTRIBUTION_CARD_WIDTH_SPACING),
      }}
    />
  </Grid>
);

export const CredentialsView: FC<CredentialsViewProps> = ({ userID, credentials, loading, ...rest }) => {
  const { t } = useTranslation();
  return (
    <UserCredentialsContainer userID={userID}>
      {({ credentialMetadata }) => (
        <ProfileCard {...rest}>
          <CardLayoutContainer>
            {loading && (
              <>
                <SkeletonItem />
                <SkeletonItem />
              </>
            )}
            {!loading &&
              credentials?.map((c, i) => (
                <CardLayoutItem
                  key={i}
                  maxWidth={{ xs: 'auto', sm: 'auto', md: '50%' }}
                  flexGrow={{ xs: 1, md: 0, lg: 1 }}
                >
                  <CredentialCard
                    entities={{
                      claim: JSON.parse(c.claim),
                      context: JSON.parse(c.context),
                      issued: c.issued,
                      expires: c.expires,
                      issuer: c.issuer,
                      description: credentialMetadata?.find(cm => cm.uniqueType === c.type)?.description,
                      name: c.name,
                      type: c.type,
                    }}
                  />
                </CardLayoutItem>
              ))}
            {!credentials.length && (
              <Grid item flexGrow={1} flexBasis={'50%'}>
                {t('credentials-view.no-data')}
              </Grid>
            )}
          </CardLayoutContainer>
        </ProfileCard>
      )}
    </UserCredentialsContainer>
  );
};
export default CredentialsView;
