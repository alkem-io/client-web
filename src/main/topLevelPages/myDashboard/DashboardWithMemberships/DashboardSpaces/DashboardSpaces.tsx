import { useTranslation } from 'react-i18next';
import { Paper, Button, Avatar, useTheme } from '@mui/material';
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
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import SpaceTile, { RECENT_SPACE_CARD_ASPECT_RATIO } from '@/domain/space/components/cards/SpaceTile';
import { defaultVisualUrls } from '@/domain/space/icons/defaultVisualUrls';
import { useDashboardSpaces } from './useDashboardSpaces';
import { gutters } from '@/core/ui/grid/utils';
import { useEffect, useMemo } from 'react';
import { Actions } from '@/core/ui/actions/Actions';
import { useColumns } from '@/core/ui/grid/GridContext';
import { useScreenSize } from '@/core/ui/grid/constants';

const DASHBOARD_MEMBERSHIPS_ALL = 100; // hardcoded limit for expensive query

const DashboardSpaces = () => {
  const {
    data,
    hasMore,
    loading,
    fetchSpaces,
    isDialogOpen,
    selectedSpaceIdx,
    selectedSpaceName,
    handleDialogOpen,
    handleDialogClose,
  } = useDashboardSpaces();

  const theme = useTheme();

  const styles = {
    loader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      width: '100%',
      height: '100%',
    },

    spaceCard: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },

    spaceCardMedia: {
      height: '180px',
      minWidth: '100%',
      objectFit: 'cover',
    },

    titleAndDescContainer: {
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      backgroundColor: theme.palette.primary.main,
    },

    spaceTitle: {
      color: theme.palette.background.paper,
    },

    spaceTagline: {
      color: theme.palette.background.paper,
    },

    exploreAllButton: {
      textTransform: 'none',
      border: `1px solid ${theme.palette.divider}`,
      aspectRatio: RECENT_SPACE_CARD_ASPECT_RATIO,
    },
  };

  const { t } = useTranslation();

  const columns = useColumns();
  const { isSmallScreen } = useScreenSize();
  const cardColumns = useMemo(() => (isSmallScreen ? columns / 2 : columns / 4), [isSmallScreen, columns]);
  const visibleSpaces = Math.max(1, Math.floor(columns / 2) - 1);

  useEffect(() => {
    fetchSpaces(); // with default limit
  }, []);

  if (loading) {
    return (
      <PageContentBlock style={styles.loader}>
        <Loading />
      </PageContentBlock>
    );
  }

  return (
    <>
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
              <Card style={styles.spaceCard}>
                <Avatar
                  variant="square"
                  sx={styles.spaceCardMedia}
                  alt={profile?.displayName}
                  src={profile?.spaceBanner?.uri || defaultVisualUrls[VisualType.Banner]}
                />
              </Card>

              <Gutters gap={gutters(0.3)} padding={gutters(0.3)} style={styles.titleAndDescContainer}>
                <PageTitle textAlign="center" style={styles.spaceTitle}>
                  {profile?.displayName}
                </PageTitle>

                {tagline && (
                  <Tagline textAlign="center" fontStyle="italic" color={styles.spaceTagline.color}>
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
                    <SpaceTile
                      key={id}
                      columns={cardColumns}
                      space={{
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
                      sx={styles.exploreAllButton}
                      endIcon={<DoubleArrowOutlined />}
                      onClick={handleDialogOpen(idx, profile?.displayName)}
                    >
                      <Caption>
                        {t('pages.home.sections.recentSpaces.seeMoreSubspaces', {
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
      {hasMore && (
        <Actions justifyContent="center" sx={{ width: '100%' }}>
          <Button variant="contained" loading={loading} onClick={() => fetchSpaces(DASHBOARD_MEMBERSHIPS_ALL)}>
            {t('buttons.load-more')}
          </Button>
        </Actions>
      )}

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
