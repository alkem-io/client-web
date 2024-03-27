import { Box, Skeleton, useTheme } from '@mui/material';
import { FC, useState } from 'react';
import { useCommunityGuidelinesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import { gutters } from '../../../../core/ui/grid/utils';
import CommunityGuidelinesInfoDialog from './CommunityGuidelinesInfoDialog';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

const CommunityGuidelinesSkeleton = () => {
  const theme = useTheme();

  return (
    <Box display="flex" gap={gutters()} marginBottom={gutters()}>
      <Skeleton variant="circular" width={gutters(2)(theme)} height={gutters(2)(theme)} />
      <Skeleton height={gutters(2)(theme)} sx={{ flexGrow: 1 }} />
    </Box>
  );
};

export interface CommunityGuidelinesBlockProps {
  communityId: string | undefined;
}

const CommunityGuidelinesBlock: FC<CommunityGuidelinesBlockProps> = ({ communityId }) => {
  const [isCommunityGuidelinesInfoDialogOpen, setIsCommunityGuidelinesInfoDialogOpen] = useState(false);

  const { data, loading } = useCommunityGuidelinesQuery({
    variables: { communityId: communityId! },
    skip: !communityId,
  });

  const openDialog = () => setIsCommunityGuidelinesInfoDialogOpen(true);
  const closeDialog = () => setIsCommunityGuidelinesInfoDialogOpen(false);

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeaderWithDialogAction
          title={data?.lookup?.community?.guidelines?.profile.displayName}
          onDialogOpen={openDialog}
        />
        <Box display="flex" flexDirection="column" gap={gutters()}>
          {loading && <CommunityGuidelinesSkeleton />}
          {!loading && (
            <OverflowGradient maxHeight={gutters(6)}>
              <Box sx={{ wordWrap: 'break-word' }}>
                <WrapperMarkdown disableParagraphPadding>
                  {data?.lookup?.community?.guidelines?.profile.description ?? ''}
                </WrapperMarkdown>
              </Box>
            </OverflowGradient>
          )}
        </Box>
      </PageContentBlock>
      <CommunityGuidelinesInfoDialog
        open={isCommunityGuidelinesInfoDialogOpen}
        onClose={closeDialog}
        guidelines={data?.lookup.community?.guidelines?.profile}
      />
    </>
  );
};

export default CommunityGuidelinesBlock;
