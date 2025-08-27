import { useMemo } from 'react';
import { useMyResourcesQuery } from '@/core/apollo/generated/apollo-hooks';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import InnovationHubCardHorizontal from '@/domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import InnovationPackCardHorizontal from '@/domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import SpaceCardHorizontal from '@/domain/space/components/cards/SpaceCardHorizontal';

const MyResources = () => {
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
      {innovationHubs?.map(hub => (
        <InnovationHubCardHorizontal key={hub.id} {...hub} size="small" />
      ))}
      {spaces.map(space => (
        <SpaceCardHorizontal
          key={space.id}
          space={{ id: space.id, about: space.about, level: space.level }}
          size="small"
          deepness={0}
          seamless
          sx={{
            display: 'inline-block',
            maxWidth: '100%',
            padding: 0,
          }}
          disableHoverState
          disableTagline
        />
      ))}
      {virtualContributors?.map(vc => (
        <ContributorCardHorizontal key={vc.id} profile={vc.profile} size="small" withUnifiedTitle seamless />
      ))}
      {innovationPacks?.map(pack => (
        <InnovationPackCardHorizontal key={pack.id} {...pack} size="small" />
      ))}
    </PageContentBlock>
  );
};

export default MyResources;
