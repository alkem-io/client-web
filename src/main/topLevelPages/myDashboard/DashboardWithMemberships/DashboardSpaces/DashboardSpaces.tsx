import { Fragment } from 'react';

import { Card } from '@mui/material';
import { Paper, Button, Avatar } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';

import Gutters from '../../../../../core/ui/grid/Gutters';
import { Caption } from '../../../../../core/ui/typography';
import GridItem from '../../../../../core/ui/grid/GridItem';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import { PageTitle, BlockTitle } from '../../../../../core/ui/typography';
import { MyMembershipsDialog } from '../../myMemberships/MyMembershipsDialog';
import JourneyTile from '../../../../../domain/journey/common/JourneyTile/JourneyTile';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';

import { useDashboardSpaces } from './useDashboardSpaces';

import defaultJourneyCardBanner from '../../../../../domain/journey/defaultVisuals/Card.jpg';

const DashboardSpaces = () => {
  const {
    t,
    data,
    loading,
    cardColumns,
    isDialogOpen,
    visibleSpaces,
    selectedSpaceIdx,
    selectedSpaceName,
    styles: {
      spaceCard,
      spaceTitle,
      spaceTagline,
      spaceCardMedia,
      spacesContainer,
      exploreAllButton,
      subSpacesContainer,
      titleAndDescContainer,
    },
    setIsDialogOpen,
    setSelectedSpaceIdx,
    setSelectedSpaceName,
  } = useDashboardSpaces();

  return (
    <Fragment>
      {data?.me.spaceMembershipsHierarchical?.map(({ space, childMemberships }, idx) => {
        if (!space) {
          return null;
        }

        const { id, profile } = space;
        const { tagline } = profile;

        return (
          <Paper key={id} style={spacesContainer}>
            <RouterLink to={profile?.url}>
              <Card style={spaceCard}>
                <Avatar
                  variant="square"
                  sx={spaceCardMedia}
                  alt={profile?.displayName}
                  src={profile?.cardBanner?.uri || defaultJourneyCardBanner}
                />
              </Card>

              <Gutters disableGap disablePadding style={titleAndDescContainer}>
                <PageTitle textAlign="center" style={spaceTitle}>
                  {profile?.displayName}
                </PageTitle>

                {tagline && (
                  <BlockTitle textAlign="center" color={spaceTagline.color} paddingBottom={1.5}>
                    {tagline}
                  </BlockTitle>
                )}
              </Gutters>
            </RouterLink>

            <Gutters sx={subSpacesContainer}>
              <PageContentBlockSeamless row disablePadding>
                {childMemberships?.slice(0, visibleSpaces).map(({ space: subSpace }) => {
                  if (!subSpace) {
                    return null;
                  }

                  const { id, profile } = subSpace;
                  const { url, cardBanner, displayName } = profile;

                  return (
                    <JourneyTile
                      key={id}
                      columns={cardColumns}
                      journeyTypeName="space"
                      journey={{ profile: { url, cardBanner, displayName } }}
                    />
                  );
                })}

                {childMemberships.length > 3 && (
                  <GridItem columns={cardColumns}>
                    <Paper
                      component={Button}
                      sx={exploreAllButton}
                      endIcon={<DoubleArrowOutlined />}
                      onClick={() => {
                        setSelectedSpaceIdx(idx);
                        setSelectedSpaceName(profile?.displayName);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Caption>
                        {t('pages.home.sections.recentJourneys.seeMoreSubspaces', {
                          spaceName: profile?.displayName,
                        })}
                      </Caption>
                    </Paper>
                  </GridItem>
                )}
              </PageContentBlockSeamless>
            </Gutters>
          </Paper>
        );
      })}

      <MyMembershipsDialog
        loading={loading}
        open={isDialogOpen}
        showFooterText={false}
        title={selectedSpaceName}
        data={
          selectedSpaceIdx !== null ? data?.me?.spaceMembershipsHierarchical[selectedSpaceIdx]?.childMemberships : []
        }
        onClose={() => setIsDialogOpen(false)}
      />
    </Fragment>
  );
};

export default DashboardSpaces;
