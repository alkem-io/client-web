import React, { FC, forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid, styled } from '@mui/material';
import { times } from 'lodash';
import ContributorCard, {
  ContributorCardProps,
  ContributorCardSkeleton,
} from '../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { PaginatedResult } from './ContributorsSearch/ContributorsSearchContainer';
import { OrganizationContributorFragment, UserContributorFragment } from '../../../models/graphql-schema';
import useLazyLoading from '../../shared/pagination/useLazyLoading';
import DashboardGenericSection from '../../shared/components/DashboardSections/DashboardGenericSection';
import ImageBackdrop from '../../shared/components/Backdrops/ImageBackdrop';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../common/utils/urlBuilders';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';

const USERS_GRAYED_OUT_IMAGE = '/contributors/users-grayed.png';
export const ITEMS_PER_PAGE = 16;
const ITEMS_PER_LINE = ITEMS_PER_PAGE / 2;
const GRID_ITEM_WIDTH = 100 / ITEMS_PER_LINE;

const ScrollerBox = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  maxHeight: theme.spacing(45),
  paddingRight: theme.spacing(1),
}));

const userToContributorCard = (user: UserContributorFragment): ContributorCardProps => {
  return {
    id: user.id,
    displayName: user.displayName,
    avatar: user.userProfile?.avatar?.uri ?? '',
    url: buildUserProfileUrl(user.nameID),
    tooltip: {
      tags: (user.userProfile?.tagsets || []).flatMap(y => y.tags),
      city: user.userProfile?.location?.city || '',
      country: user.userProfile?.location?.country || '',
    },
  };
};

const organizationToContributorCard = (org: OrganizationContributorFragment): ContributorCardProps => {
  return {
    id: org.id,
    displayName: org.displayName,
    avatar: org.orgProfile.avatar?.uri ?? '',
    url: buildOrganizationUrl(org.nameID),
  };
};

export interface ContributorsViewProps {
  showUsers: boolean;
  usersPaginated: PaginatedResult<UserContributorFragment> | undefined; // only for registered users
  organizationsPaginated: PaginatedResult<OrganizationContributorFragment> | undefined;
}

const ContributorsView: FC<ContributorsViewProps> = ({
  showUsers,
  usersPaginated: users,
  organizationsPaginated: orgs,
}) => {
  const { t } = useTranslation();

  const UsersLoader = useMemo(
    () =>
      forwardRef<HTMLDivElement>((props, ref) => (
        <>
          <Box ref={ref}>
            <Button onClick={() => users?.fetchMore(ITEMS_PER_PAGE)}>{t('buttons.load-more')}</Button>
          </Box>
        </>
      )),
    [users?.pageSize]
  );

  const usersLoader = useLazyLoading(UsersLoader, {
    hasMore: users?.hasMore || false,
    loading: users?.loading || false,
    fetchMore: () => (users?.fetchMore ? users?.fetchMore() : Promise.resolve()),
  });

  const OrgsLoader = useMemo(
    () =>
      forwardRef<HTMLDivElement>((props, ref) => (
        <>
          <Box ref={ref}>
            <Button onClick={() => orgs?.fetchMore(ITEMS_PER_PAGE)}>{t('buttons.load-more')}</Button>
          </Box>
        </>
      )),
    [orgs?.pageSize]
  );

  const orgsLoader = useLazyLoading(OrgsLoader, {
    hasMore: orgs?.hasMore || false,
    loading: orgs?.loading || false,
    fetchMore: () => (orgs?.fetchMore ? orgs?.fetchMore() : Promise.resolve()),
  });

  return (
    <>
      <SectionSpacer double />
      <DashboardGenericSection headerText={t('pages.contributors.organizations.title')}>
        <ScrollerBox>
          <Grid container spacing={1}>
            <>
              {orgs?.loading &&
                times(ITEMS_PER_PAGE, i => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={`__loading_${i}`}>
                    <ContributorCardSkeleton />
                  </Grid>
                ))}
              {!orgs?.loading &&
                orgs?.items?.map(organizationToContributorCard).map(org => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={org.id}>
                    <ContributorCard {...org} />
                  </Grid>
                ))}
              {!orgs?.loading && orgs?.hasMore && (
                <Grid item flexBasis="100%" display={'flex'} justifyContent={'end'}>
                  {orgsLoader}
                </Grid>
              )}
            </>
          </Grid>
        </ScrollerBox>
      </DashboardGenericSection>
      <SectionSpacer double />
      <DashboardGenericSection headerText={t('pages.contributors.users.title')}>
        {showUsers && (
          <ScrollerBox>
            <Grid container spacing={1}>
              {users?.loading &&
                times(ITEMS_PER_PAGE, i => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={`__loading_${i}`}>
                    <ContributorCardSkeleton />
                  </Grid>
                ))}
              {!users?.loading &&
                users?.items?.map(userToContributorCard).map(user => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={user.id}>
                    <ContributorCard {...user} />
                  </Grid>
                ))}
              {!users?.loading && users?.hasMore && (
                <Grid item flexBasis="100%" display={'flex'} justifyContent={'end'}>
                  {usersLoader}
                </Grid>
              )}
            </Grid>
          </ScrollerBox>
        )}
        {!showUsers && (
          <Grid item>
            <ImageBackdrop
              src={USERS_GRAYED_OUT_IMAGE}
              backdropMessage={'login'}
              blockName={'all-contributing-users'}
              messageSx={{
                fontWeight: 'bold',
                marginTop: theme => theme.spacing(10),
                marginBottom: theme => theme.spacing(-10),
              }}
            />
          </Grid>
        )}
      </DashboardGenericSection>
    </>
  );
};
export default ContributorsView;
