import { Box, Skeleton } from '@mui/material';
import OrganizationVerifiedStatus from '@/domain/community/organization/organizationVerifiedStatus/OrganizationVerifiedStatus';
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
          <CircleTag text={`${count}`} color="primary" size="small" />
        </Skeleton>
      ) : (
        <CircleTag text={`${count}`} color="primary" size="small" />
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
