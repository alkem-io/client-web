import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useMyAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import HorizontalCardsGroup from '../../../../core/ui/content/HorizontalCardsGroup';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import Loading from '../../../../core/ui/loading/Loading';
import { useUserContext } from '../../../../domain/community/user';
import useNewVirtualContributorWizard from '../newVirtualContributorWizard/useNewVirtualContributorWizard';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import defaultJourneyAvatar from '../../../../domain/journey/defaultVisuals/Avatar.jpg';
import GridItem from '../../../../core/ui/grid/GridItem';
import RouterLink from '../../../../core/ui/link/RouterLink';
import Gutters from '../../../../core/ui/grid/Gutters';
import StartingSpace from '../startingSpace/StartingSpace';

const MyAccountBlock = () => {
  const { t } = useTranslation();
  const { data, loading } = useMyAccountQuery({ fetchPolicy: 'cache-and-network' });
  const { startWizard, NewVirtualContributorWizard } = useNewVirtualContributorWizard();

  // Curently displaying only the first hosted space and the first VC in it.
  const hostedSpace = data?.me.mySpaces.filter(
    spaceData =>
      spaceData.space.account && spaceData.space.account.host?.id === data?.me.user?.id && spaceData.space.level === 0
  )[0]?.space;

  const virtualContributor = data?.me.user?.accounts
    .filter(account => account.id === hostedSpace?.account.id)
    .filter(vc => vc.virtualContributors.length > 0)[0]?.virtualContributors[0];

  const { user } = useUserContext();

  return (
    <PageContentBlock columns={4}>
      <PageContentBlockHeader title={t('pages.home.sections.myAccount.title')} fullWidth />
      {loading ? (
        <Loading text="" />
      ) : (
        <>
          {hostedSpace ? (
            <HorizontalCardsGroup title={t('pages.home.sections.myAccount.hostedSpaces')}>
              <Gutters paddingY={0}>
                <GridItem>
                  <BadgeCardView
                    variant="rounded"
                    visual={
                      <Avatar
                        src={hostedSpace.profile.avatar?.uri || defaultJourneyAvatar}
                        alt={t('common.avatar-of', { user: hostedSpace.profile.displayName })}
                      />
                    }
                    component={RouterLink}
                    to={hostedSpace.profile.url}
                  >
                    <BlockSectionTitle>{hostedSpace.profile.displayName}</BlockSectionTitle>
                    <BlockSectionTitle>{hostedSpace.profile.tagline}</BlockSectionTitle>
                  </BadgeCardView>
                </GridItem>
              </Gutters>
            </HorizontalCardsGroup>
          ) : (
            <>
              <Caption>{t('pages.home.sections.myAccount.hostedSpaces')}</Caption>
              <StartingSpace />
            </>
          )}

          {virtualContributor ? (
            <HorizontalCardsGroup title={t('pages.home.sections.myAccount.virtualContributors')}>
              <Gutters paddingY={0}>
                <GridItem>
                  <BadgeCardView
                    variant="rounded"
                    visual={
                      <Avatar
                        src={virtualContributor.profile.avatar?.uri}
                        alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })}
                      />
                    }
                    component={RouterLink}
                    to={virtualContributor.profile.url}
                  >
                    <BlockSectionTitle>{virtualContributor.profile.displayName}</BlockSectionTitle>
                  </BadgeCardView>
                </GridItem>
              </Gutters>
            </HorizontalCardsGroup>
          ) : (
            <>
              <Caption>{t('pages.home.sections.myAccount.virtualContributors')}</Caption>
              <Button
                aria-label={t('pages.home.sections.myAccount.createVCButton')}
                variant="contained"
                disabled={!(user && user.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace)) || !hostedSpace}
                sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5) }}
                onClick={startWizard}
              >
                {hostedSpace
                  ? t('pages.home.sections.myAccount.createVCButton')
                  : t('pages.home.sections.myAccount.createVCButtonDisabled')}
              </Button>
            </>
          )}
        </>
      )}
      <NewVirtualContributorWizard />
    </PageContentBlock>
  );
};

export default MyAccountBlock;
