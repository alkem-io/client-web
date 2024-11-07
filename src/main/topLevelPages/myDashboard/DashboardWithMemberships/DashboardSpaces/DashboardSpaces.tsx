import { Fragment } from 'react';

import { Paper, Button } from '@mui/material';
import { Card, Link, CardMedia } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';

import Gutters from '../../../../../core/ui/grid/Gutters';
import { Caption } from '../../../../../core/ui/typography';
import GridItem from '../../../../../core/ui/grid/GridItem';
import { BlockTitle, PageTitle } from '../../../../../core/ui/typography';
import JourneyTile from '../../../../../domain/journey/common/JourneyTile/JourneyTile';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';

import { useDashboardSpaces } from './useDashboardSpaces';

const DashboardSpaces = ({ onSeeMore }: { onSeeMore?: () => void }) => {
  const {
    t,
    data,
    cardColumns,
    visibleSpaces,
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
  } = useDashboardSpaces();

  return (
    <Fragment>
      {data?.me.spaceMembershipsHierarchical?.map(({ space, childMemberships }) => {
        if (!space) {
          return null;
        }

        const { id, profile } = space;
        const { tagline } = profile;

        return (
          <Paper key={id} style={spacesContainer}>
            <Link href={profile?.url}>
              <Card style={spaceCard}>
                <CardMedia
                  component="img"
                  alt="Space Banner"
                  height={spaceCardMedia.height}
                  image={profile.cardBanner?.uri}
                  sx={{ width: spaceCardMedia.width }}
                />
              </Card>

              <Gutters style={titleAndDescContainer} gap={0}>
                <PageTitle textAlign="center" style={spaceTitle}>
                  {profile.displayName}
                </PageTitle>

                {tagline && (
                  <BlockTitle textAlign="center" color={spaceTagline.color}>
                    {tagline}
                  </BlockTitle>
                )}
              </Gutters>
            </Link>

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
                      journey={{ profile: { url, cardBanner, displayName } }}
                      journeyTypeName="space"
                    />
                  );
                })}

                <GridItem columns={cardColumns}>
                  <Paper component={Button} sx={exploreAllButton} endIcon={<DoubleArrowOutlined />} onClick={onSeeMore}>
                    <Caption>{t('pages.home.sections.recentJourneys.seeMoreSubspaces')}</Caption>
                  </Paper>
                </GridItem>
              </PageContentBlockSeamless>
            </Gutters>
          </Paper>
        );
      })}
    </Fragment>
  );
};

export default DashboardSpaces;
