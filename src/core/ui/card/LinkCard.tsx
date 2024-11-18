import { Card, CardProps } from '@mui/material';
import ConditionalLink from '../link/ConditionalLink';
import withElevationOnHover from '@/domain/shared/components/withElevationOnHover';

interface LinkCardProps extends CardProps {
  to?: string;
  elevationDisabled?: boolean;
  keepScroll?: boolean;
}

const ElevatedCard = withElevationOnHover(Card);

const LinkCard = ({ to, elevationDisabled = false, keepScroll, ...rest }: LinkCardProps) => (
  <ConditionalLink condition={!!to} to={to} keepScroll={keepScroll}>
    <ElevatedCard {...rest} elevationDisabled={elevationDisabled} />
  </ConditionalLink>
);

export default LinkCard;
