import { useTranslation } from 'react-i18next';
import { Paper, Button, Avatar } from '@mui/material';
import { Card } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import Gutters from '@/core/ui/grid/Gutters';
import GridItem from '@/core/ui/grid/GridItem';
import Loading from '@/core/ui/loading/Loading';
import { PageTitle } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption, Tagline } from '@/core/ui/typography';
import { MyMembershipsDialog } from '@/main/topLevelPages/myDashboard/myMemberships/MyMembershipsDialog';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import JourneyTile from '@/domain/journey/common/JourneyTile/JourneyTile';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { defaultVisualUrls } from '@/domain/journey/defaultVisuals/defaultVisualUrls';
import { useDashboardSpaces } from './useDashboardSpaces';
import { gutters } from '@/core/ui/grid/utils';

const DashboardSpaces = () => {
  const {
    data,
    loading,

    cardColumns,
    isDialogOpen,
    visibleSpaces,
    selectedSpaceIdx,
    selectedSpaceName,
    styles: { loader, spaceCard, spaceTitle, spaceTagline, spaceCardMedia, exploreAllButton, titleAndDescContainer },

    handleDialogOpen,
    handleDialogClose,
  } = useDashboardSpaces();

  const { t } = useTranslation();

  return (
    <>
      {loading && (
        <PageContentBlock style={loader}>
          <Loading />
        </PageContentBlock>
      )}

      {data?.me.spaceMembershipsHierarchical?.map(({ space, childMemberships }, idx) => {
        if (!space) {
          return null;
        }

        const {
          id,
          about: {
            profile: { tagline, ...profile },
          },
        } = space;
        const hasChildMemberships = childMemberships?.length > 0;

        return (
          <PageContentBlock key={id}>
            <Gutters component={RouterLink} to={profile?.url} disableGap disablePadding>
              <Card style={spaceCard}>
                <Avatar
                  variant="square"
                  sx={spaceCardMedia}
                  alt={profile?.displayName}
                  src={profile?.spaceBanner?.uri || defaultVisualUrls[VisualType.Banner]}
                />
              </Card>

              <Gutters gap={gutters(0.3)} padding={gutters(0.3)} style={titleAndDescContainer}>
                <PageTitle textAlign="center" style={spaceTitle}>
                  {profile?.displayName}
                </PageTitle>

                {tagline && (
                  <Tagline textAlign="center" fontStyle="italic" color={spaceTagline.color}>
                    {tagline}
                  </Tagline>
                )}
              </Gutters>
            </Gutters>

            {hasChildMemberships && (
              <Gutters row disablePadding>
                {childMemberships?.slice(0, visibleSpaces).map(({ space: subSpace }) => {
                  if (!subSpace) {
                    return null;
                  }

                  const { id, about, level } = subSpace;

                  return (
                    <JourneyTile
                      key={id}
                      columns={cardColumns}
                      journey={{
                        about: about,
                        level: level,
                      }}
                    />
                  );
                })}

                {childMemberships.length > 3 && (
                  <GridItem columns={cardColumns}>
                    <Paper
                      component={Button}
                      sx={exploreAllButton}
                      endIcon={<DoubleArrowOutlined />}
                      onClick={handleDialogOpen(idx, profile?.displayName)}
                    >
                      <Caption>
                        {t('pages.home.sections.recentJourneys.seeMoreSubspaces', {
                          spaceName: profile?.displayName,
                        })}
                      </Caption>
                    </Paper>
                  </GridItem>
                )}
              </Gutters>
            )}
          </PageContentBlock>
        );
      })}

      <MyMembershipsDialog
        loading={loading}
        open={isDialogOpen}
        showFooterText={false}
        title={selectedSpaceName}
        data={
          (selectedSpaceIdx !== null && data?.me?.spaceMembershipsHierarchical[selectedSpaceIdx]?.childMemberships) ||
          []
        }
        onClose={handleDialogClose}
      />
    </>
  );
};

export default DashboardSpaces;
