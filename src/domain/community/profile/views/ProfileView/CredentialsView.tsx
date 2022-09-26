import { Grid, Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CredentialCard } from '../../../../../common/components/composite/common/cards';
import ProfileCard, {
  ProfileCardProps,
} from '../../../../../common/components/composite/common/cards/ProfileCard/ProfileCard';
import { CardLayoutContainer, CardLayoutItem } from '../../../../shared/layout/CardsLayout/CardsLayout';
import UserCredentialsContainer from '../../../../../containers/user/UserCredentialsContainer';

export interface CredentialsViewProps extends ProfileCardProps {
  userID: string;
  loading?: boolean;
}

const SkeletonItem = () => (
  <Grid item>
    <Skeleton
      variant="rectangular"
      sx={{
        height: theme => theme.spacing(theme.cards.contributionCard.height / 2),
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(theme.cards.contributionCard.width),
      }}
    />
  </Grid>
);

export const CredentialsView: FC<CredentialsViewProps> = ({ userID, loading, ...rest }) => {
  const { t } = useTranslation();
  return (
    <UserCredentialsContainer userID={userID}>
      {({ verifiedCredentials, credentialMetadata }, { getCredentialMetadataLoading, getUserCredentialsLoading }) => (
        <ProfileCard {...rest}>
          <CardLayoutContainer>
            {getUserCredentialsLoading && getCredentialMetadataLoading && (
              <>
                <SkeletonItem />
                <SkeletonItem />
              </>
            )}
            {!getUserCredentialsLoading &&
              !getCredentialMetadataLoading &&
              verifiedCredentials?.map((c, i) => (
                <CardLayoutItem
                  key={i}
                  maxWidth={{ xs: 'auto', sm: 'auto', md: '50%' }}
                  flexGrow={{ xs: 1, md: 0, lg: 1 }}
                >
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
                  />
                </CardLayoutItem>
              ))}
            {!verifiedCredentials.length && (
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
