import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useMyAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, VisualType } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import HorizontalCardsGroup from '../../../../core/ui/content/HorizontalCardsGroup';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import Loading from '../../../../core/ui/loading/Loading';
import { ApplicationHydrator } from '../../../../domain/community/pendingMembership/PendingMemberships';
import { PendingApplication, useUserContext } from '../../../../domain/community/user';
import { ROUTE_CREATE_SPACE } from '../../../../domain/platform/routes/constants';
import NewMembershipCard from '../newMemberships/NewMembershipCard';

const MyAccountBlock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading } = useMyAccountQuery();

  // Curently displaying only the first hosted space and the first VC in it.
  const hostedSpace = data?.me.spaceMemberships.filter(
    space => space.account && space.account.host?.id === data?.me.user?.id && space.level === 0
  )[0];

  const virtualContributor = data?.me.user?.accounts
    .filter(account => account.id === hostedSpace?.account.id)
    .filter(vc => vc.virtualContributors.length > 0)[0]?.virtualContributors[0];

  const { user } = useUserContext();
  let createLink = t('pages.home.sections.startingSpace.url');
  if (user && user.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace)) {
    createLink = `/${ROUTE_CREATE_SPACE}`;
  }

  return (
    <PageContentBlock columns={4}>
      <PageContentBlockHeader title={t('pages.home.sections.myAccount.title')} fullWidth />
      {loading ? (
        <Loading text="" />
      ) : (
        <>
          {hostedSpace ? (
            <HorizontalCardsGroup title={t('pages.home.sections.myAccount.hostedSpaces')}>
              {[hostedSpace].map(space => (
                <ApplicationHydrator
                  key={space.id}
                  application={
                    {
                      id: space.id,
                      space: space,
                    } as unknown as PendingApplication
                  }
                  visualType={VisualType.Avatar}
                >
                  {({ application: hydratedApplication }) => (
                    <NewMembershipCard
                      space={hydratedApplication?.space}
                      to={hydratedApplication?.space.profile.url}
                      membershipType="membership"
                    />
                  )}
                </ApplicationHydrator>
              ))}
            </HorizontalCardsGroup>
          ) : (
            <>
              <Caption>{t('pages.home.sections.myAccount.hostedSpaces')}</Caption>
              <Button
                onClick={() => navigate(createLink)}
                aria-label={t('pages.home.sections.myAccount.createSpaceButton')}
                variant="contained"
                sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5) }}
              >
                {t('pages.home.sections.myAccount.createSpaceButton')}
              </Button>
            </>
          )}

          {virtualContributor ? (
            <HorizontalCardsGroup title={t('pages.home.sections.myAccount.hostedSpaces')}>
              {[virtualContributor].map(vc => (
                <ApplicationHydrator
                  key={vc.id}
                  application={
                    {
                      id: vc.id,
                      space: vc,
                    } as unknown as PendingApplication
                  }
                  visualType={VisualType.Avatar}
                >
                  {({ application: hydratedApplication }) => (
                    <NewMembershipCard
                      space={hydratedApplication?.space}
                      to={hydratedApplication?.space.profile.url}
                      membershipType="membership"
                    />
                  )}
                </ApplicationHydrator>
              ))}
            </HorizontalCardsGroup>
          ) : (
            <>
              <Caption>{t('pages.home.sections.myAccount.virtualContributors')}</Caption>
              <Button
                aria-label={t('pages.home.sections.myAccount.createVCButton')}
                variant="contained"
                disabled={!(user && user.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace)) || !hostedSpace}
                sx={{ textTransform: 'none', paddingTop: gutters(0.5), paddingBottom: gutters(0.5) }}
              >
                {hostedSpace
                  ? t('pages.home.sections.myAccount.createVCButton')
                  : t('pages.home.sections.myAccount.createVCButtonDisabled')}
              </Button>
            </>
          )}
        </>
      )}
    </PageContentBlock>
  );
};

export default MyAccountBlock;
