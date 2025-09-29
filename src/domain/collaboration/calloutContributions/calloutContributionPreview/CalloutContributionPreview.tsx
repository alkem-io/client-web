import { useCalloutContributionQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderCardLike from '@/core/ui/content/PageContentBlockHeaderCardLike';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption } from '@/core/ui/typography';
import { formatDateTime } from '@/core/utils/time/utils';
import { CloseOutlined } from '@mui/icons-material';
import { Box, IconButton, Skeleton, useTheme } from '@mui/material';
import { contributionIcons } from '../../callout/icons/calloutIcons';
import { CalloutDetailsModelExtended } from '../../callout/models/CalloutDetailsModel';
import Loading from '@/core/ui/loading/Loading';
import WhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/WhiteboardPreview';
import useNavigate from '@/core/routing/useNavigate';

interface CalloutContributionPreviewProps {
  callout: CalloutDetailsModelExtended;
  contributionId: string;
  // onClose?: () => void;
}

const CalloutContributionPreview = ({ callout, contributionId }: CalloutContributionPreviewProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, loading } = useCalloutContributionQuery({
    variables: {
      contributionId,
      includeLink: callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Link),
      includePost: callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Post),
      includeWhiteboard: callout.settings.contribution.allowedTypes.includes(CalloutContributionType.Whiteboard),
    },
  });

  const contributionType = data?.lookup.contribution?.post
    ? CalloutContributionType.Post
    : data?.lookup.contribution?.link
      ? CalloutContributionType.Link
      : data?.lookup.contribution?.whiteboard
        ? CalloutContributionType.Whiteboard
        : undefined;
  const Icon = contributionType ? contributionIcons[contributionType] : undefined;

  const displayName = loading ? (
    <Skeleton variant="text" width={gutters(10)(theme)} />
  ) : (
    (contributionType === CalloutContributionType.Post && data?.lookup.contribution?.post?.profile.displayName) ||
    (contributionType === CalloutContributionType.Whiteboard &&
      data?.lookup.contribution?.whiteboard?.profile.displayName)
  );

  const author =
    (contributionType === CalloutContributionType.Post &&
      data?.lookup.contribution?.post?.createdBy?.profile.displayName) ||
    (contributionType === CalloutContributionType.Whiteboard &&
      data?.lookup.contribution?.whiteboard?.createdBy?.profile.displayName);

  const formattedCreatedDate =
    (contributionType === CalloutContributionType.Post &&
      data?.lookup.contribution?.post?.createdDate &&
      formatDateTime(data.lookup.contribution.post.createdDate)) ||
    (contributionType === CalloutContributionType.Whiteboard &&
      data?.lookup.contribution?.whiteboard?.createdDate &&
      formatDateTime(data.lookup.contribution.whiteboard.createdDate));

  return (
    <Gutters>
      <PageContentBlock>
        <PageContentBlockHeaderCardLike
          icon={Icon}
          title={displayName}
          subtitle={author}
          actions={
            <>
              <Caption>{formattedCreatedDate}</Caption>
              {/* TODO: Here the comments to the post */}
              <IconButton onClick={() => navigate(callout.framing.profile.url)}>
                <CloseOutlined />
              </IconButton>
            </>
          }
        />
        {loading && <Loading />}
        {contributionType === CalloutContributionType.Post && (
          <Box bgcolor={theme => theme.palette.background.default} padding={gutters()} margin={gutters(-1)}>
            <WrapperMarkdown>{data?.lookup.contribution?.post?.profile.description ?? ''}</WrapperMarkdown>
          </Box>
        )}
        {contributionType === CalloutContributionType.Whiteboard && (
          <Box padding={gutters()} margin={gutters(-1)}>
            <WhiteboardPreview
              whiteboard={data?.lookup.contribution?.whiteboard}
              onClick={() =>
                data?.lookup.contribution?.whiteboard?.profile.url &&
                navigate(data?.lookup.contribution?.whiteboard?.profile.url)
              } //!! this is not correct
              onClose={onClose}
            />
          </Box>
        )}
      </PageContentBlock>
    </Gutters>
  );
};

export default CalloutContributionPreview;
