import React, { ComponentType, FC, ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { times } from 'lodash';
import ContributorCardSquare, {
  ContributorCardSkeleton,
  ContributorCardSquareProps,
} from './ContributorCardSquare/ContributorCardSquare';
import { PaginatedResult } from './ContributorsSearch/ContributorsSearchContainer';
import {
  OrganizationContributorFragment,
  UserContributorFragment,
} from '../../../core/apollo/generated/graphql-schema';
import useLazyLoading from '../../shared/pagination/useLazyLoading';
import ImageBackdrop from '../../shared/components/Backdrops/ImageBackdrop';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../common/utils/urlBuilders';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import ScrollableCardsLayoutContainer from '../../../core/ui/card/CardsLayout/ScrollableCardsLayoutContainer';
import GridItem from '../../../core/ui/grid/GridItem';
import { useColumns } from '../../../core/ui/grid/GridContext';
import GridProvider from '../../../core/ui/grid/GridProvider';
import { Identifiable } from '../../shared/types/Identifiable';

const USERS_GRAYED_OUT_IMAGE = '/contributors/users-grayed.png';
export const ITEMS_PER_PAGE = 16;

const userToContributorCard = (user: UserContributorFragment): ContributorCardSquareProps => {
  return {
    id: user.id,
    displayName: user.userProfile.displayName,
    avatar: user.userProfile.visual?.uri ?? '',
    url: buildUserProfileUrl(user.nameID),
    tooltip: {
      tags: (user.userProfile?.tagsets || []).flatMap(y => y.tags),
      city: user.userProfile?.location?.city || '',
      country: user.userProfile?.location?.country || '',
    },
    isContactable: user.isContactable,
  };
};

const organizationToContributorCard = (org: OrganizationContributorFragment): ContributorCardSquareProps => {
  return {
    id: org.id,
    displayName: org.orgProfile.displayName,
    avatar: org.orgProfile.visual?.uri ?? '',
    url: buildOrganizationUrl(org.nameID),
    isContactable: true,
  };
};

export interface ContributorsViewProps {
  showUsers: boolean;
  usersPaginated: PaginatedResult<UserContributorFragment> | undefined; // only for registered users
  organizationsPaginated: PaginatedResult<OrganizationContributorFragment> | undefined;
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
      <ScrollableCardsLayoutContainer cards={false} maxHeight={theme => theme.spacing(45)}>
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

const ContributorsView: FC<ContributorsViewProps> = ({
  showUsers,
  usersPaginated: users,
  organizationsPaginated: orgs,
}) => {
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
              src={USERS_GRAYED_OUT_IMAGE}
              backdropMessage={'login'}
              blockName={'all-contributing-users'}
              messageSx={theme => ({
                [theme.breakpoints.up('sm')]: {
                  fontWeight: 'bold',
                },
                [theme.breakpoints.up('lg')]: {
                  marginTop: theme.spacing(10),
                  marginBottom: theme.spacing(-10),
                },
              })}
            />
          </Grid>
        )}
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
