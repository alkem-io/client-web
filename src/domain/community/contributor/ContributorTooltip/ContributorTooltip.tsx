import { Tooltip, type TooltipProps } from '@mui/material';
import type { ReactNode } from 'react';
import { useContributorTooltipLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { CONTRIBUTE_CARD_COLUMNS } from '@/core/ui/card/ContributeCard';
import GridProvider from '@/core/ui/grid/GridProvider';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import UserCard from '@/domain/community/user/userCard/UserCard';

interface ContributorTooltipProps extends Omit<TooltipProps, 'title'> {
  contributorId: string;
  contributorType: ActorType;
  override?: string;
  onContact?: () => void;
}

const ContributorTooltip = ({
  contributorId,
  contributorType,
  override,
  onContact,
  children,
  ...props
}: ContributorTooltipProps) => {
  const [fetchUserData, { data, loading }] = useContributorTooltipLazyQuery();

  const onOpenTooltipShow = () => {
    if (!data && !loading && !override) {
      switch (contributorType) {
        case ActorType.User:
          fetchUserData({ variables: { userId: contributorId, includeUser: true } });
          break;
        case ActorType.Organization:
          fetchUserData({ variables: { organizationId: contributorId, includeOrganization: true } });
          break;
        case ActorType.VirtualContributor:
          fetchUserData({ variables: { virtualContributorId: contributorId, includeVirtualContributor: true } });
          break;
        default:
        // Do nothing
      }
    }
  };

  const tooltipContent: ReactNode = (() => {
    if (override) {
      return <>{override}</>;
    }

    const user = data?.user;
    const organization = data?.organization;
    const virtualContributor = data?.lookup?.virtualContributor;

    let contributor;

    switch (contributorType) {
      case ActorType.User:
        contributor = user;
        break;
      case ActorType.Organization:
        contributor = organization;
        break;
      case ActorType.VirtualContributor:
        contributor = virtualContributor;
        break;
      default:
        return <div>Details not available</div>;
    }

    return (
      <RootThemeProvider>
        <GridProvider columns={CONTRIBUTE_CARD_COLUMNS}>
          <UserCard
            id={contributor?.id}
            loading={loading || !contributor}
            avatarSrc={contributor?.profile.avatar?.uri}
            avatarAltText={contributor?.profile.displayName}
            displayName={contributor?.profile.displayName}
            tags={contributor?.profile.tagsets?.flatMap(tagset => tagset.tags)}
            url={contributor?.profile.url}
            city={contributor?.profile.location?.city}
            country={contributor?.profile.location?.country}
            isContactable={Boolean(onContact)}
            onContact={onContact}
            isExpandable={false}
          />
        </GridProvider>
      </RootThemeProvider>
    );
  })();

  return (
    <Tooltip
      title={tooltipContent}
      onOpen={onOpenTooltipShow}
      arrow={true}
      {...props}
      slotProps={{ popper: { sx: { '.MuiTooltip-tooltip': { backgroundColor: 'transparent', paddingY: 0 } } } }}
    >
      {children}
    </Tooltip>
  );
};

export default ContributorTooltip;
