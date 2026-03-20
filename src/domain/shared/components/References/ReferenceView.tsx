import { Attachment as AttachmentIcon } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, Skeleton, styled, Tooltip, useTheme } from '@mui/material';
import { lighten } from '@mui/material/styles';
import type { BoxProps } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import RoundedBadge from '@/core/ui/icon/RoundedBadge';
import RouterLink from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import CroppedMarkdown from '@/core/ui/markdown/CroppedMarkdown';
import { BlockSectionTitle } from '@/core/ui/typography';
import { isFileAttachmentUrl } from '@/core/utils/links';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { ReferenceIcon } from './icons/ReferenceIcon';

export interface ReferenceViewProps extends BoxProps {
  reference: ReferenceModel;
  canEdit?: boolean;
  onClickEdit?: () => void;
  expandDescription?: boolean;
}

const Root = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'start',
  '.only-on-hover': {
    visibility: 'hidden',
  },
  '&:hover .only-on-hover': {
    visibility: 'visible',
  },
}));

const ReferenceDescription = ({ cropped, children }: { children: string | undefined; cropped: boolean }) => {
  const theme = useTheme();
  if (!children || typeof children !== 'string') {
    return null;
  }
  const markdownString = children.trim().replace(/\n+/g, '\n\n');

  return (
    <Tooltip title={children} placement="top-start" disableInteractive={true}>
      <CroppedMarkdown
        caption={true}
        maxHeightGutters={cropped ? 3 : 1000}
        overflowMarker=" "
        backgroundColor="paper"
        automaticOverflowDetector={true}
        sx={{ '& > p': { ...theme.typography.body2 }, color: lighten(theme.palette.text.primary, 0.4) }}
      >
        {markdownString}
      </CroppedMarkdown>
    </Tooltip>
  );
};

export const ReferenceViewSkeleton = (props: BoxProps) => (
  <Box {...props}>
    <BadgeCardView component={Box} visual={<Skeleton variant="circular" width={40} height={40} />}>
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="80%" />
    </BadgeCardView>
  </Box>
);

const ReferenceView = ({
  reference,
  canEdit,
  onClickEdit,
  expandDescription = false,
  ...containerProps
}: ReferenceViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const hasEditIcon = Boolean(onClickEdit) && canEdit;

  return (
    <Root {...containerProps}>
      <BadgeCardView
        component={RouterLink}
        to={reference.uri}
        visual={
          <RoundedBadge size="medium">
            {isFileAttachmentUrl(reference.uri) ? <AttachmentIcon /> : <ReferenceIcon />}
          </RoundedBadge>
        }
        flexGrow={1}
        overflow="hidden"
        textOverflow="ellipsis"
        maxWidth={hasEditIcon ? `calc(100% - ${gutters(2)(theme)})` : '100%'}
        alignItems="start"
      >
        <Tooltip title={reference.uri} placement="top-start" disableInteractive={true}>
          <BlockSectionTitle overflow="hidden" textOverflow="ellipsis">
            {reference.name}
          </BlockSectionTitle>
        </Tooltip>
        <ReferenceDescription cropped={!expandDescription}>{reference.description}</ReferenceDescription>
      </BadgeCardView>

      {hasEditIcon && (
        <Box>
          <IconButton
            size="small"
            onClick={onClickEdit}
            disabled={!canEdit}
            className="only-on-hover"
            aria-label={t('buttons.edit')}
          >
            <EditIcon />
          </IconButton>
        </Box>
      )}
    </Root>
  );
};

export default ReferenceView;
