import { Box, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Avatar from '@/core/ui/avatar/Avatar';
import { gutters } from '@/core/ui/grid/utils';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import { Caption } from '@/core/ui/typography';
import type { AuthorModel } from '@/domain/community/user/models/AuthorModel';

export interface SingleUpdateViewProps {
  author?: AuthorModel;
  createdDate?: Date;
  content?: string;
  loading?: boolean;
}

const SingleUpdateView = ({ author, createdDate, content = '', loading }: SingleUpdateViewProps) => {
  const { t } = useTranslation();
  const visual = loading ? (
    <Skeleton variant="rectangular">
      <Avatar />
    </Skeleton>
  ) : (
    <Avatar
      src={author?.avatarUrl}
      alt={author?.displayName ? t('common.avatar-of', { user: author?.displayName }) : t('common.avatar')}
    />
  );

  return (
    <>
      <BadgeCardView visual={visual}>
        {loading ? <Skeleton /> : <Caption>{author?.displayName}</Caption>}
        {loading ? <Skeleton /> : <Caption>{createdDate?.toLocaleString()}</Caption>}
      </BadgeCardView>
      {loading ? (
        <Box paddingY={1}>
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
        </Box>
      ) : (
        <OverflowGradient maxHeight={gutters(11)}>
          <WrapperMarkdown disableParagraphPadding={true}>{content}</WrapperMarkdown>
        </OverflowGradient>
      )}
    </>
  );
};

export default SingleUpdateView;
