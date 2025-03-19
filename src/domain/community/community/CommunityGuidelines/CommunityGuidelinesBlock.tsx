import { Box, Skeleton, useTheme } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommunityGuidelinesQuery } from '@/core/apollo/generated/apollo-hooks';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { gutters } from '@/core/ui/grid/utils';
import CommunityGuidelinesInfoDialog from './CommunityGuidelinesInfoDialog';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import SeeMore from '@/core/ui/content/SeeMore';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { Caption } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

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
  communityGuidelinesId: string | undefined;
  spaceUrl: string | undefined;
}

const CommunityGuidelinesBlock = ({ communityGuidelinesId, spaceUrl: journeyUrl }: CommunityGuidelinesBlockProps) => {
  const [isCommunityGuidelinesInfoDialogOpen, setIsCommunityGuidelinesInfoDialogOpen] = useState(false);

  const { data, loading } = useCommunityGuidelinesQuery({
    variables: { communityGuidelinesId: communityGuidelinesId! },
    skip: !communityGuidelinesId,
  });

  const openDialog = () => setIsCommunityGuidelinesInfoDialogOpen(true);
  const closeDialog = () => setIsCommunityGuidelinesInfoDialogOpen(false);
  const guidelines = data?.lookup.communityGuidelines;
  const communityGuidelinesReferences = guidelines?.profile.references;
  const communityGuidelinesDescription = guidelines?.profile.description;

  const { t } = useTranslation();

  const hasGuidelines = Boolean(guidelines?.profile.description);
  const isReadMoreVisible =
    Number(communityGuidelinesDescription?.length) > 0 || Number(communityGuidelinesReferences?.length) > 0;
  const showGuidelines =
    hasGuidelines || guidelines?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Create);

  return showGuidelines ? (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={guidelines?.profile.displayName} />
        {isReadMoreVisible ? (
          <>
            <Box display="flex" flexDirection="column" gap={gutters()}>
              {loading && <CommunityGuidelinesSkeleton />}
              {!loading && (
                <OverflowGradient maxHeight={gutters(6)}>
                  <Box sx={{ wordWrap: 'break-word' }}>
                    <WrapperMarkdown disableParagraphPadding>{guidelines?.profile.description ?? ''}</WrapperMarkdown>
                  </Box>
                </OverflowGradient>
              )}
            </Box>

            <SeeMore label="buttons.readMore" onClick={openDialog} />
          </>
        ) : (
          <>
            <Caption>{t('community.communityGuidelines.adminsOnly')}</Caption>
            <Caption component={RouterLink} to={`${buildSettingsUrl(journeyUrl || '')}/community`}>
              {t('community.communityGuidelines.communityGuidelinesRedirect')}
            </Caption>
          </>
        )}
      </PageContentBlock>
      <CommunityGuidelinesInfoDialog
        open={isCommunityGuidelinesInfoDialogOpen}
        onClose={closeDialog}
        guidelines={guidelines?.profile}
      />
    </>
  ) : (
    <></>
  );
};

export default CommunityGuidelinesBlock;
