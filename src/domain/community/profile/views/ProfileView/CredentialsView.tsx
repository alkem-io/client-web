import { CardLayoutContainer, CardLayoutItem } from '@/core/ui/card/cardsLayout/CardsLayout';
import CredentialCard from '@/domain/agent/credential/CredentialCard';
import CredentialProfileCard, { ProfileCardProps } from '@/domain/agent/credential/CredentialProfileCard';
import UserCredentialsContainer from '@/domain/agent/credential/verifiedCredentials/UserCredentialsContainer';
import { Grid, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CredentialsViewProps extends ProfileCardProps {
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

export const CredentialsView = ({ userID, loading, ...rest }: CredentialsViewProps) => {
  const { t } = useTranslation();
  return (
    <UserCredentialsContainer userID={userID}>
      {({
        entities: { verifiedCredentials, credentialMetadata },
        state: { getCredentialMetadataLoading, getUserCredentialsLoading },
      }) => (
        <CredentialProfileCard {...rest}>
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
        </CredentialProfileCard>
      )}
    </UserCredentialsContainer>
  );
};

export default CredentialsView;
