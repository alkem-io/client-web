import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Card, IconButton, Menu, MenuItem } from '@mui/material';
import Heading from '../shared/components/Heading';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { useTranslation } from 'react-i18next';
import { Authorization, AuthorizationPrivilege, CalloutVisibility } from '../../models/graphql-schema';
import Markdown from '../../components/core/Markdown';
import CalloutVisibilityChangeDialog from './visibility-change-dialog/CalloutVisibilityChangeDialog';
import { CalloutSummary } from './creation-dialog/steps/CalloutSummaryStep/CalloutSummaryStep';

export interface CalloutLayoutProps {
  callout: {
    id: string;
    displayName: string;
    description?: string;
    draft: boolean;
    editable?: boolean;
    authorization?: Authorization;
  };
  maxHeight?: number;
  onVisibilityChanged: (visibility: CalloutVisibility) => Promise<void>;
}

const CalloutLayout = ({
  callout,
  children,
  maxHeight,
  onVisibilityChanged,
}: PropsWithChildren<CalloutLayoutProps>) => {
  const { t } = useTranslation();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);
  // todo: should this be passed from props?
  const handleSettingsOpened = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setSettingsAnchorEl(event.currentTarget),
    []
  );
  const handleSettingsClosed = useCallback(() => setSettingsAnchorEl(null), []);
  //
  const [visDialogOpened, setVisDialogOpened] = useState(false);
  const handleVisDialogOpened = useCallback(() => {
    setVisDialogOpened(true);
    setSettingsAnchorEl(null);
  }, []);
  const handleVisDialogClosed = useCallback(() => setVisDialogOpened(false), []);
  const visDialogTitle = useMemo(
    () => `${t(`buttons.${callout.draft ? '' : 'un'}publish` as const)} ${t('common.callout')}`,
    [callout.draft]
  );
  const handleVisibilityChanged = useCallback(async (visibility: CalloutVisibility) => {
    await onVisibilityChanged(visibility);
    setVisDialogOpened(false);
  }, []);
  //
  const handleEditDialogOpened = useCallback(() => {
    setSettingsAnchorEl(null);
  }, []);

  const dontShow = callout.draft && !callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);
  if (dontShow) {
    return null;
  }

  return (
    <>
      <Card key={callout.id}>
        {callout.draft && (
          <Box padding={1.5} sx={{ color: 'neutralLight.main', backgroundColor: 'primary.main' }}>
            <Heading textAlign="center">{t('callout.draftNotice')}</Heading>
          </Box>
        )}
        <Box m={3} position="relative">
          {callout.editable && (
            <IconButton
              id="callout-settings-button"
              aria-haspopup="true"
              aria-controls={settingsOpened ? 'callout-settings-menu' : undefined}
              aria-expanded={settingsOpened ? 'true' : undefined}
              onClick={handleSettingsOpened}
              sx={theme => ({ position: 'absolute', right: theme.spacing(-1.5), top: theme.spacing(-1.5) })}
            >
              <SettingsOutlinedIcon />
            </IconButton>
          )}
          <Heading sx={{ display: 'flex', gap: 2.5 }}>
            <CampaignOutlinedIcon sx={{ fontSize: theme => theme.spacing(3) }} /> {callout.displayName}
          </Heading>
          <Markdown>{callout.description || ''}</Markdown>
          {/* Paddings are set to prevent cutting Paper shadow by overflow: scroll.
              Margins are compensating the visual shift. Except for the left margin, we want a bit of left shifting */}
          <Box
            maxHeight={maxHeight && (theme => theme.spacing(maxHeight + 4))}
            overflow={typeof maxHeight === 'undefined' ? undefined : 'auto'}
            padding={2}
            margin={-2}
            marginLeft={0}
          >
            {children}
          </Box>
        </Box>
      </Card>
      <Menu
        id="callout-settings-menu"
        aria-labelledby="callout-settings-button"
        anchorEl={settingsAnchorEl}
        open={settingsOpened}
        onClose={handleSettingsClosed}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleEditDialogOpened}>{t('buttons.edit').toLocaleUpperCase()}</MenuItem>
        <MenuItem onClick={handleVisDialogOpened}>
          {t(`buttons.${callout.draft ? '' : 'un'}publish` as const).toLocaleUpperCase()}
        </MenuItem>
      </Menu>
      <CalloutVisibilityChangeDialog
        open={visDialogOpened}
        onClose={handleVisDialogClosed}
        title={visDialogTitle}
        draft={callout.draft}
        onVisibilityChanged={handleVisibilityChanged}
      >
        <CalloutSummary callout={callout} />
      </CalloutVisibilityChangeDialog>
    </>
  );
};

export default CalloutLayout;
