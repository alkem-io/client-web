import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '../../common/components/composite/common/Accordion/Accordion';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import { Box, Button, Grid, styled } from '@mui/material';
import { times } from 'lodash';
import ContributorCard, {
  ContributorCardProps,
  ContributorCardSkeleton,
} from '../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { PaginatedResult } from '../../pages/Contributors/ContributorsSearch/ContributorsSearchContainer';
import { OrganizationContributorFragment, UserContributorFragment } from '../../models/graphql-schema';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../common/utils/urlBuilders';
import ImageBackdrop from '../../domain/shared/components/Backdrops/ImageBackdrop';

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

  return (
    <>
      <SectionSpacer double />
      <Accordion
        title={t('pages.contributors.organizations.title', { count: orgs?.firstPageSize || 0 })}
        ariaKey={'organization'}
      >
        <ScrollerBox>
          <Grid container spacing={1}>
            <>
              {orgs?.loading &&
                times(ITEMS_PER_PAGE, i => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={i}>
                    <ContributorCardSkeleton />
                  </Grid>
                ))}
              {!orgs?.loading &&
                orgs?.items?.map(organizationToContributorCard).map((org, i) => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={i}>
                    <ContributorCard {...org} />
                  </Grid>
                ))}
            </>
          </Grid>
        </ScrollerBox>
      </Accordion>
      <SectionSpacer double />
      <Accordion title={t('pages.contributors.users.title')} ariaKey={'organization'}>
        {showUsers && (
          <ScrollerBox>
            <Grid container spacing={1}>
              {users?.loading &&
                times(ITEMS_PER_PAGE, i => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={i}>
                    <ContributorCardSkeleton />
                  </Grid>
                ))}
              {!users?.loading &&
                users?.items?.map(userToContributorCard).map((user, i) => (
                  <Grid item flexBasis={`${GRID_ITEM_WIDTH}%`} key={i}>
                    <ContributorCard {...user} />
                  </Grid>
                ))}
              {!users?.loading && users?.hasMore && (
                <Grid item flexBasis="100%" display={'flex'} justifyContent={'end'}>
                  <Button onClick={() => users.fetchMore(ITEMS_PER_PAGE)}>{t('buttons.load-more')}</Button>
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
      </Accordion>
    </>
  );
};
export default ContributorsView;
