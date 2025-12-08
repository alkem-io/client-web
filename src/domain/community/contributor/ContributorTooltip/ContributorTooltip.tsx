import { ReactNode, useMemo } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import { useContributorTooltipLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { CONTRIBUTE_CARD_COLUMNS } from '@/core/ui/card/ContributeCard';
import GridProvider from '@/core/ui/grid/GridProvider';
import UserCard from '@/domain/community/user/userCard/UserCard';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

interface ContributorTooltipProps extends Omit<TooltipProps, 'title'> {
  contributorId: string;
  contributorType: RoleSetContributorType;
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
        case RoleSetContributorType.User:
          fetchUserData({ variables: { userId: contributorId, includeUser: true } });
          break;
        case RoleSetContributorType.Organization:
          fetchUserData({ variables: { organizationId: contributorId, includeOrganization: true } });
          break;
        case RoleSetContributorType.Virtual:
          fetchUserData({ variables: { virtualContributorId: contributorId, includeVirtualContributor: true } });
          break;
        default:
        // Do nothing
      }
    }
  };

  const tooltipContent: ReactNode = useMemo(() => {
    if (override) {
      return <>{override}</>;
    }

    const user = data?.user;
    const organization = data?.organization;
    const virtualContributor = data?.lookup?.virtualContributor;

    let contributor;

    switch (contributorType) {
      case RoleSetContributorType.User:
        contributor = user;
        break;
      case RoleSetContributorType.Organization:
        contributor = organization;
        break;
      case RoleSetContributorType.Virtual:
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
  }, [data, loading, override, contributorType, onContact]);

  return (
    <Tooltip
      title={tooltipContent}
      onOpen={onOpenTooltipShow}
      arrow
      {...props}
      slotProps={{ popper: { sx: { '.MuiTooltip-tooltip': { backgroundColor: 'transparent', paddingY: 0 } } } }}
    >
      {children}
    </Tooltip>
  );
};

export default ContributorTooltip;
