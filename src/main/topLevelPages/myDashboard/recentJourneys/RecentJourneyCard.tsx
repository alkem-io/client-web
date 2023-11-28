import { Visual } from '../../../../domain/common/visual/Visual';
import { Avatar, Paper, Skeleton } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import GridItem from '../../../../core/ui/grid/GridItem';
import withElevationOnHover from '../../../../domain/shared/components/withElevationOnHover';

interface RecentJourneyCardProps {
  journey:
    | {
        profile: {
          url: string;
          cardBanner?: Visual;
        };
      }
    | undefined;
}

export const RECENT_JOURNEY_CARD_ASPECT_RATIO = '175/100';

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const RecentJourneyCard = ({ journey }: RecentJourneyCardProps) => {
  return (
    <GridItem columns={2}>
      <ElevatedPaper component={RouterLink} loose to={journey?.profile.url ?? ''}>
        {journey && (
          <Avatar
            src={journey?.profile.cardBanner?.uri}
            sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
            variant="square"
          />
        )}
        {!journey && (
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
          />
        )}
      </ElevatedPaper>
    </GridItem>
  );
};

export default RecentJourneyCard;
