import OrganizationVerifiedStatus from '@/domain/community/contributor/organization/OrganizationVerifiedStatus';
import { Box, Skeleton } from '@mui/material';
import CircleTag from '../tags/CircleTag';
import { Caption } from '../typography';

type LabeledCountProps = {
  label: string;
  count: number;
  loading?: boolean;
  verified?: boolean;
};

const LabeledCount = ({ label, count, loading, verified }: LabeledCountProps) => (
  <Box display="flex" flexDirection="column" alignItems="flex-end">
    <Box display="flex">
      <Caption sx={{ marginRight: 1, flexGrow: 1 }}>{loading ? <Skeleton /> : label}</Caption>
      {loading ? (
        <Skeleton variant="circular">
          <CircleTag count={count} />
        </Skeleton>
      ) : (
        <CircleTag count={count} />
      )}
    </Box>
    {loading ? (
      <Skeleton>
        <OrganizationVerifiedStatus verified={Boolean(verified)} />
      </Skeleton>
    ) : (
      <OrganizationVerifiedStatus verified={Boolean(verified)} />
    )}
  </Box>
);

export default LabeledCount;
