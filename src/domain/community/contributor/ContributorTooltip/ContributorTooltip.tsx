import { ReactNode, useMemo } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import { useContributorTooltipLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { CONTRIBUTE_CARD_COLUMNS } from '@/core/ui/card/ContributeCard';
import GridProvider from '@/core/ui/grid/GridProvider';
import Loading from '@/core/ui/loading/Loading';
import UserCard from '@/domain/community/user/userCard/UserCard';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

interface ContributorTooltipProps extends Omit<TooltipProps, 'title'> {
  contributorId: string;
  contributorType: RoleSetContributorType;
  override?: string;
}

const ContributorTooltip = ({
  contributorId,
  contributorType,
  override,
  children,
  ...props
}: ContributorTooltipProps) => {
  const [fetchUserData, { data, loading }] = useContributorTooltipLazyQuery();

  const onOpenTooltipShow = () => {
    if (!data && !loading && !override) {
      switch (contributorType) {
        case RoleSetContributorType.User:
          fetchUserData({ variables: { userId: contributorId, includeUser: true } });
          break;
        case RoleSetContributorType.Organization: // TODO: Pending implementation
        case RoleSetContributorType.Virtual:
        default: // Do nothing for now - Inviting Organizations is not implemented and Virtual Contributors are invited in a different way
        // throw new Error('Unsupported contributor type for tooltip');
      }
    }
  };

  const tooltipContent: ReactNode = useMemo(() => {
    if (override) {
      return <>{override}</>;
    }

    const user = data?.user;
    if (loading || !user) {
      return <Loading />;
    }
    if (contributorType === RoleSetContributorType.User) {
      return (
        <RootThemeProvider>
          <GridProvider columns={CONTRIBUTE_CARD_COLUMNS}>
            <UserCard
              id={user.id}
              avatarSrc={user.profile.avatar?.uri}
              avatarAltText={user.profile.displayName}
              displayName={user.profile.displayName}
              tags={user.profile.tagsets?.flatMap(tagset => tagset.tags)}
              url={user.profile.url}
              city={user.profile.location?.city}
              country={user.profile.location?.country}
              isContactable={false}
            />
          </GridProvider>
        </RootThemeProvider>
      );
    }
    // TODO: Handle Organization and Virtual Contributor types
    return <div>Details not available</div>; // In theory this will never be reached
  }, [data, loading, override, contributorType]);

  return (
    <Tooltip
      title={tooltipContent}
      onOpen={onOpenTooltipShow}
      arrow
      {...props}
      slotProps={{ popper: { sx: { '.MuiTooltip-tooltip': { backgroundColor: 'transparent' } } } }}
    >
      {children}
    </Tooltip>
  );
};

export default ContributorTooltip;
