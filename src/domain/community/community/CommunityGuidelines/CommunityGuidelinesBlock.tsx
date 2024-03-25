import { Box, Skeleton, useTheme } from '@mui/material';
import { FC, useMemo, useState } from 'react';
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
    <Box>
      <Box display="flex" gap={gutters()} marginBottom={gutters()}>
        <Skeleton variant="circular" width={gutters(2)(theme)} height={gutters(2)(theme)} />
        <Skeleton height={gutters(2)(theme)} sx={{ flexGrow: 1 }} />
      </Box>
    </Box>
  );
};

export interface CommunityGuidelinesBlockProps {
  spaceId: string | undefined;
}

const CommunityGuidelinesBlock: FC<CommunityGuidelinesBlockProps> = ({ spaceId }) => {
  const [isCommunityGuidelinesInfoDialogOpen, setIsCommunityGuidelinesInfoDialogOpen] = useState(false);

  const { data, loading } = useCommunityGuidelinesQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const communityGuidelines = useMemo(
    () => ({
      communityGuidelinesId: data?.space?.community?.guidelines?.id,
      displayName: data?.space?.community?.guidelines?.profile.displayName,
      description: data?.space?.community?.guidelines?.profile.description,
      profile: data?.space?.community?.guidelines?.profile,
      references: data?.space?.community?.guidelines?.profile.references,
    }),
    [data]
  );

  const openDialog = () => setIsCommunityGuidelinesInfoDialogOpen(true);
  const closeDialog = () => setIsCommunityGuidelinesInfoDialogOpen(false);

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeaderWithDialogAction
          title={communityGuidelines.displayName ?? ''}
          onDialogOpen={openDialog}
        />
        <Box display="flex" flexDirection="column" gap={gutters()}>
          {loading && <CommunityGuidelinesSkeleton />}
          {!loading && (
            <OverflowGradient maxHeight={gutters(6)}>
              <Box sx={{ wordWrap: 'break-word' }}>
                <WrapperMarkdown disableParagraphPadding>{communityGuidelines.description ?? ''}</WrapperMarkdown>
              </Box>
            </OverflowGradient>
          )}
        </Box>
      </PageContentBlock>
      <CommunityGuidelinesInfoDialog
        open={isCommunityGuidelinesInfoDialogOpen}
        onClose={closeDialog}
        guidelines={communityGuidelines}
      />
    </>
  );
};

export default CommunityGuidelinesBlock;
