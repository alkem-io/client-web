import { Box, Skeleton } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import { useTranslation } from 'react-i18next';

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
          <WrapperMarkdown disableParagraphPadding>{content}</WrapperMarkdown>
        </OverflowGradient>
      )}
    </>
  );
};

export default SingleUpdateView;
