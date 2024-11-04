import { useMemo } from 'react';
import { useMyResourcesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useUserContext } from '../../../../domain/community/user';
import InnovationHubCardHorizontal from '../../../../domain/innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';
import InnovationPackCardHorizontal from '../../../../domain/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import JourneyCardHorizontal from '../../../../domain/journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import { useDashboardContext } from '../DashboardContext';

const MyResources = () => {
  const { accountId } = useUserContext();
  const { activityEnabled } = useDashboardContext();

  const { data: accountData, loading: loadingAccount } = useMyResourcesQuery({
    variables: {
      accountId: accountId ?? '',
    },
    skip: !activityEnabled || !accountId,
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
    !activityEnabled ||
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
        <JourneyCardHorizontal
          key={space.id}
          journeyTypeName={undefined}
          journey={{ profile: space.profile, community: {} }}
          size="small"
          seamless
          sx={{ display: 'inline-block', maxWidth: '100%', padding: 0 }}
          disableHoverState
        />
      ))}
      {virtualContributors?.map(vc => (
        <ContributorCardHorizontal key={vc.id} profile={vc.profile} size="small" seamless />
      ))}
      {innovationPacks?.map(pack => (
        <InnovationPackCardHorizontal key={pack.id} {...pack} size="small" />
      ))}
    </PageContentBlock>
  );
};

export default MyResources;
