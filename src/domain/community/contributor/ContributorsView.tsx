import React, { FC, forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid, styled } from '@mui/material';
import { times } from 'lodash';
import ContributorCardSquare, {
  ContributorCardSquareProps,
  ContributorCardSkeleton,
} from './ContributorCardSquare/ContributorCardSquare';
import { PaginatedResult } from './ContributorsSearch/ContributorsSearchContainer';
import {
  OrganizationContributorFragment,
  UserContributorFragment,
} from '../../../core/apollo/generated/graphql-schema';
import useLazyLoading from '../../shared/pagination/useLazyLoading';
import ImageBackdrop from '../../shared/components/Backdrops/ImageBackdrop';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../common/utils/urlBuilders';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';

const USERS_GRAYED_OUT_IMAGE = '/contributors/users-grayed.png';
export const ITEMS_PER_PAGE = 16;
const ITEMS_PER_LINE = ITEMS_PER_PAGE / 2;
const GRID_ITEM_WIDTH = 100 / ITEMS_PER_LINE;

const ScrollerBox = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  maxHeight: theme.spacing(45),
  paddingRight: theme.spacing(1),
}));

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
    [users, t]
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
    [orgs, t]
  );

  const orgsLoader = useLazyLoading(OrgsLoader, {
    hasMore: orgs?.hasMore || false,
    loading: orgs?.loading || false,
    fetchMore: () => (orgs?.fetchMore ? orgs?.fetchMore() : Promise.resolve()),
  });

  return (
    <>
      <SectionSpacer double />
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.contributors.users.title')} />
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
                    <ContributorCardSquare {...user} />
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
      <SectionSpacer double />
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.contributors.organizations.title')} />
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
                    <ContributorCardSquare {...org} />
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
      </PageContentBlock>
    </>
  );
};

export default ContributorsView;
