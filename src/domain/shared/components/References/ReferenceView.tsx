import { Box, IconButton, Tooltip, styled, useTheme } from '@mui/material';
import { Reference } from '@/domain/common/profile/Profile';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import { RoundedIconProps } from '@/core/ui/icon/RoundedIcon';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { ReferenceIcon } from './icons/ReferenceIcon';
import RouterLink from '@/core/ui/link/RouterLink';
import RoundedBadge from '@/core/ui/icon/RoundedBadge';
import EditIcon from '@mui/icons-material/Edit';
import { isFileAttachmentUrl } from '@/core/utils/links';
import { Attachment as AttachmentIcon } from '@mui/icons-material';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';

export interface ReferenceViewProps {
  reference: Reference;
  icon?: RoundedIconProps['component'];
  canEdit?: boolean;
  onClickEdit?: () => void;
}

const Root = styled(Box)(() => ({
  display: 'flex',
  '.only-on-hover': {
    display: 'none',
  },
  '&:hover .only-on-hover': {
    display: 'block',
  },
}));

type ReferenceDescriptionProps = {
  children: string | undefined;
};

const ReferenceDescription = ({ children }: ReferenceDescriptionProps) => {
  if (!children) {
    return null;
  }

  return (
    <Tooltip title={children} placement="top-start" disableInteractive>
      <CardText noWrap>{children}</CardText>
    </Tooltip>
  );
};

const ReferenceView = ({ reference, canEdit, onClickEdit }: ReferenceViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Root>
      <BadgeCardView
        component={RouterLink}
        to={reference.uri}
        visual={
          <RoundedBadge size="medium">
            {isFileAttachmentUrl(reference.uri) ? <AttachmentIcon /> : <ReferenceIcon />}
          </RoundedBadge>
        }
        sx={{ flexGrow: 1, maxWidth: `calc(100% - ${gutters(2)(theme)})` }}
      >
        <Tooltip title={reference.uri} placement="top-start" disableInteractive>
          <BlockSectionTitle>{reference.name}</BlockSectionTitle>
        </Tooltip>
        <ReferenceDescription>{reference.description}</ReferenceDescription>
      </BadgeCardView>

      {canEdit && onClickEdit && (
        <IconButton
          size="small"
          onClick={onClickEdit}
          disabled={!canEdit}
          className="only-on-hover"
          aria-label={t('buttons.edit')}
        >
          <EditIcon />
        </IconButton>
      )}
    </Root>
  );
};

export default ReferenceView;
