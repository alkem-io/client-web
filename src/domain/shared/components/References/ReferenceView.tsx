import React, { FC } from 'react';
import { Box, IconButton, Tooltip, styled, useTheme } from '@mui/material';
import { Reference } from '../../../common/profile/Profile';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography';
import { RoundedIconProps } from '../../../../core/ui/icon/RoundedIcon';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { ReferenceIcon } from './icons/ReferenceIcon';
import RouterLink from '../../../../core/ui/link/RouterLink';
import RoundedBadge from '../../../../core/ui/icon/RoundedBadge';
import EditIcon from '@mui/icons-material/Edit';
import { isFileAttachmentUrl } from '../../../../core/utils/links';
import { Attachment as AttachmentIcon } from '@mui/icons-material';
import { gutters } from '../../../../core/ui/grid/utils';

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

interface ReferenceDescriptionProps {
  children: string | undefined;
}

const ReferenceDescription: FC<ReferenceDescriptionProps> = ({ children }) => {
  if (!children) {
    return null;
  }

  return (
    <Tooltip title={children} placement="top-start" disableInteractive>
      <CardText sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{children}</CardText>
    </Tooltip>
  );
};

const ReferenceView: FC<ReferenceViewProps> = ({ reference, canEdit, onClickEdit }) => {
  const theme = useTheme();
  return (
    <Root>
      <BadgeCardView
        component={RouterLink}
        to={reference.uri}
        loose
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
      {canEdit && (
        <IconButton size="small" onClick={onClickEdit} className="only-on-hover">
          <EditIcon />
        </IconButton>
      )}
    </Root>
  );
};

export default ReferenceView;
