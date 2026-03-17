import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyResourcesQuery } from '@/core/apollo/generated/apollo-hooks';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { BlockSectionTitle } from '@/core/ui/typography';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import InnovationPackCardHorizontal from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import SpaceCardHorizontal from '@/domain/space/components/cards/SpaceCardHorizontal';

const MyResources = () => {
  const { t } = useTranslation();
  const { accountId } = useCurrentUserContext();

  const { data: accountData, loading: loadingAccount } = useMyResourcesQuery({
    variables: {
      accountId: accountId ?? '',
    },
    skip: !accountId,
  });

  const { innovationHubs, spaces, virtualContributors, innovationPacks } = useMemo(
    () => ({
      innovationHubs: accountData?.lookup.account?.innovationHubs ?? [],
      spaces: accountData?.lookup.account?.spaces ?? [],
      virtualContributors: accountData?.lookup.account?.virtualContributors ?? [],
      innovationPacks: accountData?.lookup.account?.innovationPacks ?? [],
    }),
    [accountData]
  );

  if (
    loadingAccount ||
    !accountData?.lookup.account ||
    (innovationHubs.length < 1 && spaces?.length < 1 && virtualContributors?.length < 1 && innovationPacks?.length < 1)
  ) {
    return null;
  }

  return (
    <PageContentBlock>
      {innovationHubs.length > 0 && (
        <Gutters disablePadding={true}>
          <BlockSectionTitle sx={{ mb: 1 }}>{t('pages.home.sections.resources.innovationHubs')}</BlockSectionTitle>
          {innovationHubs?.map(hub => (
            <InnovationHubCardHorizontal key={hub.id} {...hub} size="medium" />
          ))}
        </Gutters>
      )}
      {spaces.length > 0 && (
        <Gutters disablePadding={true} gap={gutters(0.5)}>
          <BlockSectionTitle sx={{ mb: 1 }}>{t('pages.home.sections.resources.spaces')}</BlockSectionTitle>
          {spaces.map(space => (
            <SpaceCardHorizontal
              key={space.id}
              space={{ id: space.id, about: space.about, level: space.level }}
              size="medium"
              deepness={0}
              withIcon={false}
              seamless={true}
              sx={{
                display: 'inline-block',
                maxWidth: '100%',
                padding: 0,
              }}
              disableHoverState={true}
              disableTagline={true}
            />
          ))}
        </Gutters>
      )}
      {virtualContributors.length > 0 && (
        <Gutters disablePadding={true} gap={gutters(0.5)}>
          <BlockSectionTitle sx={{ mb: 1 }}>{t('pages.home.sections.resources.virtualContributors')}</BlockSectionTitle>
          {virtualContributors.map(vc => (
            <ContributorCardHorizontal
              key={vc.id}
              profile={vc.profile}
              size="medium"
              withUnifiedTitle={true}
              seamless={true}
            />
          ))}
        </Gutters>
      )}
      {innovationPacks.length > 0 && (
        <Gutters disablePadding={true} gap={gutters(0.5)}>
          <BlockSectionTitle sx={{ mb: 1 }}>{t('pages.home.sections.resources.innovationPacks')}</BlockSectionTitle>
          {innovationPacks.map(pack => (
            <InnovationPackCardHorizontal key={pack.id} {...pack} size="medium" />
          ))}
        </Gutters>
      )}
    </PageContentBlock>
  );
};

export default MyResources;
