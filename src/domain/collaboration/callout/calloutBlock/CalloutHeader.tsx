import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { ExpandContentIcon } from '../../../../core/ui/content/ExpandContent';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import Authorship from '../../../../core/ui/authorship/Authorship';
import { BlockTitle } from '../../../../core/ui/typography';
import SkipLink from '../../../../core/ui/keyboardNavigation/SkipLink';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNextBlockAnchor } from '../../../../core/ui/keyboardNavigation/NextBlockAnchor';

interface CalloutHeaderProps {
  callout: {
    authorAvatarUri?: string;
    publishedAt?: string;
    authorName?: string;
    framing: {
      profile: {
        url: string;
        displayName: string;
      };
    };
    editable?: boolean;
  };
  expanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  settingsOpen?: boolean;
  onOpenSettings?: (event: React.MouseEvent<HTMLElement>) => void;
  contributionsCount: number;
}

const CalloutHeader = ({
  callout,
  expanded = false,
  onCollapse,
  onExpand,
  settingsOpen = false,
  onOpenSettings,
  contributionsCount,
}: CalloutHeaderProps) => {
  const { t } = useTranslation();

  const nextBlockAnchor = useNextBlockAnchor();

  const hasCalloutDetails = callout.authorName && callout.publishedAt;

  return (
    <DialogHeader
      actions={
        <>
          <IconButton
            onClick={expanded ? onCollapse : onExpand}
            aria-label={t('buttons.expandWindow')}
            aria-haspopup="true"
          >
            {expanded ? <Close /> : <ExpandContentIcon />}
          </IconButton>
          {callout.editable && (
            <IconButton
              id="callout-settings-button"
              aria-label={t('common.settings')}
              aria-haspopup="true"
              aria-controls={settingsOpen ? 'callout-settings-menu' : undefined}
              aria-expanded={settingsOpen ? 'true' : undefined}
              onClick={onOpenSettings}
            >
              <SettingsOutlinedIcon />
            </IconButton>
          )}
          <ShareButton url={callout.framing.profile.url} entityTypeName="callout" />
        </>
      }
      titleContainerProps={{ display: 'block', position: 'relative' }}
    >
      {hasCalloutDetails && (
        <Authorship
          authorAvatarUri={callout.authorAvatarUri}
          date={callout.publishedAt}
          authorName={callout.authorName}
        >
          {`${callout.authorName} • ${t('callout.contributions', {
            count: contributionsCount,
          })}`}
        </Authorship>
      )}
      {!hasCalloutDetails && <BlockTitle noWrap>{callout.framing.profile.displayName}</BlockTitle>}
      <SkipLink anchor={nextBlockAnchor} sx={{ position: 'absolute', right: 0, top: 0, zIndex: 99999 }} />
    </DialogHeader>
  );
};

export default CalloutHeader;
