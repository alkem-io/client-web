import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Authorship from '@/core/ui/authorship/Authorship';
import { BlockTitle } from '@/core/ui/typography';
import SkipLink from '@/core/ui/keyboardNavigation/SkipLink';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useNextBlockAnchor } from '@/core/ui/keyboardNavigation/NextBlockAnchor';
import { CalloutDetailsModelExtended } from '../models/CalloutDetailsModel';

interface CalloutHeaderProps {
  callout: CalloutDetailsModelExtended;
  expanded?: boolean;
  onExpand?: (callout: CalloutDetailsModelExtended) => void;
  onCollapse?: () => void;
  settingsOpen?: boolean;
  onOpenSettings?: (event: React.MouseEvent<HTMLElement>) => void;
  calloutActions?: boolean;
}

const CalloutHeader = ({
  callout,
  expanded = false,
  onCollapse,
  onExpand,
  settingsOpen = false,
  onOpenSettings,
  calloutActions = true,
}: CalloutHeaderProps) => {
  const { t } = useTranslation();

  const nextBlockAnchor = useNextBlockAnchor();

  const collapsedActions = () => (
    <>
      {expanded && (
        <IconButton onClick={onCollapse} aria-label={t('buttons.expandWindow')} aria-haspopup="true">
          <Close />
        </IconButton>
      )}
      <IconButton
        id="callout-settings-button"
        aria-label={t('common.settings')}
        aria-haspopup="true"
        aria-controls={settingsOpen ? 'callout-settings-menu' : undefined}
        aria-expanded={settingsOpen ? 'true' : undefined}
        onClick={onOpenSettings}
      >
        <MoreVertIcon color="primary" />
      </IconButton>
      <Authorship author={callout.createdBy} date={callout.publishedDate} />
    </>
  );

  return (
    <DialogHeader
      actions={calloutActions ? collapsedActions() : null}
      titleContainerProps={{ display: 'block', position: 'relative' }}
      id="callout-title"
    >
      <BlockTitle noWrap onClick={() => onExpand?.(callout)} sx={{ cursor: 'pointer' }}>
        {callout.framing.profile.displayName}
      </BlockTitle>
      <SkipLink anchor={nextBlockAnchor} sx={{ position: 'absolute', right: 0, top: 0, zIndex: 99999 }} />
    </DialogHeader>
  );
};

export default CalloutHeader;
