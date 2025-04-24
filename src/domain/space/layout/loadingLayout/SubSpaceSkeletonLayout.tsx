import SubspacePageLayout from '@/domain/space/layout/flowLayout/SubspacePageLayout';
import { Skeleton } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';

const SpaceSkeletonLayout = () => {
  return (
    <SubspacePageLayout
      spaceId={undefined}
      spaceHierarchyPath={undefined}
      spaceLevel={undefined}
      levelZeroSpaceId={undefined}
      parentSpaceId={undefined}
      loading
      welcome={
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      }
      actions={<Skeleton width="100%" />}
      infoColumnChildren={<Skeleton width="100%" />}
    >
      <Loading />
    </SubspacePageLayout>
  );
};

export default SpaceSkeletonLayout;
