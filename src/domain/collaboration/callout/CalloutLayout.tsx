import React, { PropsWithChildren, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Card, IconButton, Menu, MenuItem, styled } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import {
  Authorization,
  AuthorizationPrivilege,
  Callout,
  CalloutState,
  CalloutType,
  CalloutVisibility,
} from '../../../models/graphql-schema';
import WrapperMarkdown from '../../../common/components/core/WrapperMarkdown';
import Heading from '../../shared/components/Heading';
import { CalloutSummary } from './CalloutSummary';
import CalloutVisibilityChangeDialog from './edit/visibility-change-dialog/CalloutVisibilityChangeDialog';
import CalloutEditDialog from './edit/edit-dialog/CalloutEditDialog';
import { CalloutEditType } from './edit/CalloutEditType';
import ShareButton from '../../shared/components/ShareDialog/ShareButton';
import { CalloutCardTemplate } from './creation-dialog/CalloutCreationDialog';

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
    state: CalloutState;
    draft: boolean;
    editable?: boolean;
    authorization?: Authorization;
    url: string;
    cardTemplate?: CalloutCardTemplate;
  };
  calloutNames: string[];
}

const TitleBar = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const CalloutActionsBar = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(-1.5),
  marginTop: theme.spacing(-1.5),
  height: theme.spacing(5),
  display: 'flex',
  flexFlow: 'row-reverse',
}));

const CalloutLayout = ({
  callout,
  children,
  onVisibilityChange,
  onCalloutEdit,
  onCalloutDelete,
  calloutNames,
}: PropsWithChildren<CalloutLayoutProps>) => {
  const { t } = useTranslation();

  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);
  const handleSettingsOpened = (event: React.MouseEvent<HTMLElement>) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);

  const [visDialogOpen, setVisDialogOpen] = useState(false);
  const handleVisDialogOpen = () => {
    setVisDialogOpen(true);
    setSettingsAnchorEl(null);
  };
  const handleVisDialogClose = () => setVisDialogOpen(false);
  const visDialogTitle = useMemo(
    () => `${t(`buttons.${callout.draft ? '' : 'un'}publish` as const)} ${t('common.callout')}`,
    [callout.draft, t]
  );
  const handleVisibilityChange = async (visibility: CalloutVisibility) => {
    await onVisibilityChange(callout.id, visibility);
    setVisDialogOpen(false);
  };
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
        <Box m={3}>
          <TitleBar>
            <Heading sx={{ display: 'flex', gap: 2.5 }}>
              <CampaignOutlinedIcon sx={{ fontSize: theme => theme.spacing(3) }} /> {callout.displayName}
            </Heading>
            <CalloutActionsBar>
              {callout.editable && (
                <IconButton
                  id="callout-settings-button"
                  aria-haspopup="true"
                  aria-controls={settingsOpened ? 'callout-settings-menu' : undefined}
                  aria-expanded={settingsOpened ? 'true' : undefined}
                  onClick={handleSettingsOpened}
                >
                  <SettingsOutlinedIcon />
                </IconButton>
              )}
              <ShareButton url={callout.url} entityTypeName="callout" />
            </CalloutActionsBar>
          </TitleBar>
          <WrapperMarkdown>{callout.description || ''}</WrapperMarkdown>
          {children}
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
        calloutNames={calloutNames}
      />
    </>
  );
};

export default CalloutLayout;
