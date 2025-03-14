import {
  OrganizationContributorFragment,
  RoleSetContributorType,
  UserContributorFragment,
} from '@/core/apollo/generated/graphql-schema';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useColumns } from '@/core/ui/grid/GridContext';
import GridItem from '@/core/ui/grid/GridItem';
import GridProvider from '@/core/ui/grid/GridProvider';
import { Identifiable } from '@/core/utils/Identifiable';
import ImageBackdrop from '@/domain/shared/components/Backdrops/ImageBackdrop';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import { Box, Grid } from '@mui/material';
import { times } from 'lodash';
import { ComponentType, ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorCardSquare, {
  ContributorCardSkeleton,
  ContributorCardSquareProps,
} from '../contributor/ContributorCardSquare/ContributorCardSquare';
import {
  PaginatedResult,
  VirtualContributor,
  VirtualContributors,
} from '../contributor/ContributorsSearch/ContributorsSearchContainer';

const grayedOutUsersImgSrc = '/contributors/users-grayed.png';
export const ITEMS_PER_PAGE = 32;

const userToContributorCard = (user: UserContributorFragment): ContributorCardSquareProps => {
  return {
    id: user.id,
    displayName: user.userProfile.displayName,
    avatar: user.userProfile.visual?.uri ?? '',
    url: user.userProfile.url,
    tooltip: {
      tags: (user.userProfile?.tagsets || []).flatMap(y => y.tags),
      city: user.userProfile?.location?.city || '',
      country: user.userProfile?.location?.country || '',
    },
    isContactable: user.isContactable,
    contributorType: RoleSetContributorType.User,
  };
};

const organizationToContributorCard = (org: OrganizationContributorFragment): ContributorCardSquareProps => {
  return {
    id: org.id,
    displayName: org.orgProfile.displayName,
    avatar: org.orgProfile.visual?.uri ?? '',
    url: org.orgProfile.url,
    isContactable: true,
    contributorType: RoleSetContributorType.Organization,
  };
};

const vcToContributorCard = (vc: VirtualContributor): ContributorCardSquareProps => {
  return {
    id: vc.id,
    displayName: vc.profile.displayName,
    avatar: vc.profile.avatar?.uri ?? '',
    url: vc.profile.url ?? '',
    tooltip: {
      tags: (vc.profile?.tagsets ?? []).flatMap(y => y.tags),
      city: vc.profile?.location?.city ?? '',
      country: vc.profile?.location?.country ?? '',
    },
    isContactable: false,
    contributorType: RoleSetContributorType.Virtual,
  };
};

export interface ContributorsViewProps {
  showUsers: boolean;
  usersPaginated: PaginatedResult<UserContributorFragment> | undefined; // only for registered users
  organizationsPaginated: PaginatedResult<OrganizationContributorFragment> | undefined;
  virtualContributors: VirtualContributors | undefined;
}

interface ContributorsListProps<Item extends Identifiable> {
  items: Item[] | undefined;
  loading?: boolean;
  hasMoreRef?: Ref<HTMLDivElement>;
  cardComponent: ComponentType<Item>;
  loader: ReactNode;
}

const ContributorsList = <Item extends Identifiable>({
  cardComponent: Card,
  items,
  loading,
  loader,
}: ContributorsListProps<Item>) => {
  const columns = useColumns();

  return (
    <GridProvider columns={16} force={columns === 12}>
      <ScrollableCardsLayoutContainer cards={false} maxHeight={theme => theme.spacing(26)}>
        {items?.map(item => (
          <GridItem columns={2} key={item.id}>
            <Box>
              <Card {...item} />
            </Box>
          </GridItem>
        ))}
        {loader}
        {loading &&
          times(ITEMS_PER_PAGE, i => (
            <GridItem columns={2} key={`__loading_${i}`}>
              <Box>
                <ContributorCardSkeleton />
              </Box>
            </GridItem>
          ))}
      </ScrollableCardsLayoutContainer>
    </GridProvider>
  );
};

const ContributorsView = ({
  showUsers,
  usersPaginated: users,
  organizationsPaginated: orgs,
  virtualContributors: vcs,
}: ContributorsViewProps) => {
  const { t } = useTranslation();

  const usersLoader = useLazyLoading(Box, {
    hasMore: users?.hasMore || false,
    loading: users?.loading || false,
    fetchMore: () => (users?.fetchMore ? users?.fetchMore() : Promise.resolve()),
  });

  const orgsLoader = useLazyLoading(Box, {
    hasMore: orgs?.hasMore || false,
    loading: orgs?.loading || false,
    fetchMore: () => (orgs?.fetchMore ? orgs?.fetchMore() : Promise.resolve()),
  });

  return (
    <>
      <PageContentBlock columns={12}>
        <PageContentBlockHeader title={t('pages.contributors.users.title')} />
        {showUsers && (
          <ContributorsList
            items={users?.items?.map(userToContributorCard)}
            cardComponent={ContributorCardSquare}
            loading={users?.loading}
            loader={usersLoader}
          />
        )}
        {!showUsers && (
          <Grid item>
            <ImageBackdrop
              src={grayedOutUsersImgSrc}
              backdropMessage="login"
              blockName="all-contributing-users"
              messageSx={theme => ({
                [theme.breakpoints.up('sm')]: {
                  fontWeight: 'bold',
                },
              })}
            />
          </Grid>
        )}
      </PageContentBlock>
      <PageContentBlock columns={12}>
        <PageContentBlockHeader title={t('pages.contributors.virtualContributors.title')} />
        <ContributorsList
          items={vcs?.items?.map(vcToContributorCard)}
          cardComponent={ContributorCardSquare}
          loading={vcs?.loading}
          loader={undefined}
        />
      </PageContentBlock>
      <PageContentBlock columns={12}>
        <PageContentBlockHeader title={t('pages.contributors.organizations.title')} />
        <ContributorsList
          items={orgs?.items?.map(organizationToContributorCard)}
          cardComponent={ContributorCardSquare}
          loading={orgs?.loading}
          loader={orgsLoader}
        />
      </PageContentBlock>
    </>
  );
};

export default ContributorsView;
