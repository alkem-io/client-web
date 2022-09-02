import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Card, IconButton, Menu, MenuItem } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import {
  Authorization,
  AuthorizationPrivilege,
  Callout,
  CalloutType,
  CalloutVisibility,
} from '../../models/graphql-schema';
import Markdown from '../../common/components/core/Markdown';
import Heading from '../shared/components/Heading';
import { CalloutSummary } from './creation-dialog/steps/CalloutSummaryStep/CalloutSummaryStep';
import CalloutVisibilityChangeDialog from './edit/visibility-change-dialog/CalloutVisibilityChangeDialog';
import CalloutEditDialog from './edit/edit-dialog/CalloutEditDialog';
import { CalloutEditType } from './edit/CalloutEditType';

export interface CalloutLayoutEvents {
  onVisibilityChange: (calloutId: Callout['id'], visibility: CalloutVisibility) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  onCalloutDelete: (callout: CalloutEditType) => Promise<void>;
}

export interface CalloutLayoutProps extends CalloutLayoutEvents {
  callout: {
    id: string;
    displayName: string;
    description: string;
    type: CalloutType;
    draft: boolean;
    editable?: boolean;
    authorization?: Authorization;
  };
  maxHeight?: number;
}

const CalloutLayout = ({
  callout,
  children,
  maxHeight,
  onVisibilityChange,
  onCalloutEdit,
  onCalloutDelete,
}: PropsWithChildren<CalloutLayoutProps>) => {
  const { t } = useTranslation();

  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);
  const handleSettingsOpened = (event: React.MouseEvent<HTMLElement>) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);
  //
  const [visDialogOpen, setVisDialogOpen] = useState(false);
  const handleVisDialogOpen = () => {
    setVisDialogOpen(true);
    setSettingsAnchorEl(null);
  };
  const handleVisDialogClose = () => setVisDialogOpen(false);
  const visDialogTitle = useMemo(
    () => `${t(`buttons.${callout.draft ? '' : 'un'}publish` as const)} ${t('common.callout')}`,
    [callout.draft]
  );
  const handleVisibilityChange = async (visibility: CalloutVisibility) => {
    await onVisibilityChange(callout.id, visibility);
    setVisDialogOpen(false);
  };
  //
  const [editDialogOpened, setEditDialogOpened] = useState(false);
  const handleEditDialogOpen = () => {
    setSettingsAnchorEl(null);
    setEditDialogOpened(true);
  };
  const handleEditDialogClosed = () => setEditDialogOpened(false);
  const handleCalloutEdit = useCallback(
    async (newCallout: CalloutEditType) => {
      await onCalloutEdit(newCallout);
      setEditDialogOpened(false);
    },
    [onCalloutEdit, setEditDialogOpened]
  );

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
        onClose={handleSettingsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleEditDialogOpen}>{t('buttons.edit').toLocaleUpperCase()}</MenuItem>
        <MenuItem onClick={handleVisDialogOpen}>
          {t(`buttons.${callout.draft ? '' : 'un'}publish` as const).toLocaleUpperCase()}
        </MenuItem>
      </Menu>
      <CalloutVisibilityChangeDialog
        open={visDialogOpen}
        onClose={handleVisDialogClose}
        title={visDialogTitle}
        draft={callout.draft}
        onVisibilityChanged={handleVisibilityChange}
      >
        <CalloutSummary callout={callout} />
      </CalloutVisibilityChangeDialog>
      <CalloutEditDialog
        open={editDialogOpened}
        onClose={handleEditDialogClosed}
        callout={callout}
        title={`${t('buttons.edit')} ${t('common.callout')}`}
        onCalloutEdit={handleCalloutEdit}
        onDelete={onCalloutDelete}
      />
    </>
  );
};

export default CalloutLayout;
