import { Box, IconButton, Tooltip, styled, useTheme } from '@mui/material';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { ReferenceIcon } from './icons/ReferenceIcon';
import RouterLink from '@/core/ui/link/RouterLink';
import RoundedBadge from '@/core/ui/icon/RoundedBadge';
import EditIcon from '@mui/icons-material/Edit';
import { isFileAttachmentUrl } from '@/core/utils/links';
import { Attachment as AttachmentIcon } from '@mui/icons-material';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { BoxProps } from '@mui/system';

export interface ReferenceViewProps extends BoxProps {
  reference: ReferenceModel;
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

const ReferenceView = ({ reference, canEdit, onClickEdit, ...containerProps }: ReferenceViewProps) => {
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
      >
        <Tooltip title={reference.uri} placement="top-start" disableInteractive>
          <BlockSectionTitle overflow="hidden" textOverflow="ellipsis">
            {reference.name}
          </BlockSectionTitle>
        </Tooltip>
        <ReferenceDescription>{reference.description}</ReferenceDescription>
      </BadgeCardView>

      {hasEditIcon && (
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
