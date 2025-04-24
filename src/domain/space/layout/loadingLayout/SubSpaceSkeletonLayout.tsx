import { Skeleton } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';
import PageContent from '@/core/ui/content/PageContent';
import InfoColumn from '@/core/ui/content/InfoColumn';

const SpaceSkeletonLayout = () => {
  return (
    <PageContent>
      <InfoColumn>
        <Skeleton />
      </InfoColumn>
      <Loading />
    </PageContent>
  );
};

export default SpaceSkeletonLayout;
