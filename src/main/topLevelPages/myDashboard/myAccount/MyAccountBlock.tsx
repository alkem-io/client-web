import { useTranslation } from 'react-i18next';
import { Button, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import { useMyAccountQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import Loading from '../../../../core/ui/loading/Loading';
import { useUserContext } from '../../../../domain/community/user';
import useNewVirtualContributorWizard from '../newVirtualContributorWizard/useNewVirtualContributorWizard';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import defaultJourneyAvatar from '../../../../domain/journey/defaultVisuals/Avatar.jpg';
import RouterLink, { RouterLinkProps } from '../../../../core/ui/link/RouterLink';
import Gutters from '../../../../core/ui/grid/Gutters';
import { ROUTE_CREATE_SPACE } from '../../../../domain/platform/routes/constants';

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

  let createLink = t('pages.home.sections.startingSpace.url');

  if (user && user.hasPlatformPrivilege(AuthorizationPrivilege.CreateSpace)) {
    createLink = `/${ROUTE_CREATE_SPACE}`;
  }

  const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
    props: ListItemButtonProps<D, P> & RouterLinkProps
  ) => <ListItemButton component={RouterLink} {...props} />;

  return (
    <PageContentBlock columns={4}>
      <PageContentBlockHeader title={t('pages.home.sections.myAccount.title')} fullWidth />
      {loading ? (
        <Loading text="" />
      ) : (
        <>
          {hostedSpace ? (
            <Gutters disablePadding disableGap>
              <Caption>{t('pages.home.sections.myAccount.hostedSpaces')}</Caption>
              <BadgeCardView
                variant="rounded"
                visual={
                  <Avatar
                    src={hostedSpace.profile.cardBanner?.uri || defaultJourneyAvatar}
                    alt={t('common.avatar-of', { user: hostedSpace.profile.displayName })}
                  />
                }
                component={Wrapper}
                to={hostedSpace.profile.url}
              >
                <BlockSectionTitle>{hostedSpace.profile.displayName}</BlockSectionTitle>
                <BlockSectionTitle>{hostedSpace.profile.tagline}</BlockSectionTitle>
              </BadgeCardView>
            </Gutters>
          ) : (
            <Gutters disablePadding disableGap>
              <Caption>{t('pages.home.sections.myAccount.hostedSpaces')}</Caption>
              <Button
                aria-label={t('pages.home.sections.myAccount.createSpaceButton')}
                variant="contained"
                component={RouterLink}
                to={createLink}
                sx={{ padding: gutters(0.5), textTransform: 'none' }}
              >
                {t('pages.home.sections.myAccount.createSpaceButton')}
              </Button>
            </Gutters>
          )}

          {virtualContributor ? (
            <Gutters disablePadding disableGap>
              <Caption>{t('pages.home.sections.myAccount.virtualContributors')}</Caption>
              <BadgeCardView
                variant="rounded"
                visual={
                  <Avatar
                    src={virtualContributor.profile.avatar?.uri}
                    alt={t('common.avatar-of', { user: virtualContributor.profile.displayName })}
                  />
                }
                component={Wrapper}
                to={virtualContributor.profile.url}
              >
                <BlockSectionTitle>{virtualContributor.profile.displayName}</BlockSectionTitle>
              </BadgeCardView>
            </Gutters>
          ) : (
            <Gutters disablePadding disableGap>
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
            </Gutters>
          )}
        </>
      )}
      <NewVirtualContributorWizard />
    </PageContentBlock>
  );
};

export default MyAccountBlock;
