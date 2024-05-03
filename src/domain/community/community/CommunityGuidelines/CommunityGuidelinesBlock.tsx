import { Box, Skeleton, useTheme } from '@mui/material';
import { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunityGuidelinesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { gutters } from '../../../../core/ui/grid/utils';
import CommunityGuidelinesInfoDialog from './CommunityGuidelinesInfoDialog';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { Caption } from '../../../../core/ui/typography';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { buildJourneyAdminUrl } from '../../../../main/routing/urlBuilders';

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

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const hasGuidelines = !!data?.lookup.community?.guidelines.profile.description;
  const alwaysShowGuidelines = data?.lookup.community?.guidelines.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Create
  );

  return alwaysShowGuidelines ? (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={data?.lookup?.community?.guidelines?.profile.displayName} />
        {hasGuidelines ? (
          <>
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
            <SeeMore label="buttons.readMore" onClick={openDialog} />
          </>
        ) : (
          <>
            <Caption>{t('community.communityGuidelines.adminsOnly')}</Caption>
            <Caption component={RouterLink} to={buildJourneyAdminUrl(pathname)}>
              {t('community.communityGuidelines.memberGuidelinesRedirect')}
            </Caption>
          </>
        )}
      </PageContentBlock>
      <CommunityGuidelinesInfoDialog
        open={isCommunityGuidelinesInfoDialogOpen}
        onClose={closeDialog}
        guidelines={data?.lookup.community?.guidelines?.profile}
      />
    </>
  ) : (
    <></>
  );
};

export default CommunityGuidelinesBlock;
