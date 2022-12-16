import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Card, IconButton, Menu, MenuItem, styled } from '@mui/material';
import {
  Authorization,
  AuthorizationPrivilege,
  CalloutState,
  CalloutType,
  CalloutVisibility,
} from '../../../core/apollo/generated/graphql-schema';
import WrapperMarkdown from '../../../common/components/core/WrapperMarkdown';
import Heading from '../../shared/components/Heading';
import { CalloutSummary } from './CalloutSummary';
import CalloutVisibilityChangeDialog from './edit/visibility-change-dialog/CalloutVisibilityChangeDialog';
import CalloutEditDialog from './edit/edit-dialog/CalloutEditDialog';
import { CalloutEditType } from './edit/CalloutEditType';
import ShareButton from '../../shared/components/ShareDialog/ShareButton';
import { CalloutCardTemplate } from './creation-dialog/CalloutCreationDialog';
import CalloutBlockMarginal from './Contribute/CalloutBlockMarginal';
import { gutters } from '../../../core/ui/grid/utils';
import { BlockTitle, Caption } from '../../../core/ui/typography';
import { CalloutLayoutEvents } from './Types';

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
  contributionsCount: number;
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

const CalloutDetailsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  margin: theme.spacing(2),
  marginBottom: 0,
}));

const CalloutDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

const CalloutMisc = styled(Box)(() => ({
  display: 'flex',
  flexGrow: 1,
  justifyContent: 'space-between',
}));

const CalloutDate = ({ date }: { date: Date | string }) => <Caption alignSelf="end">{date}</Caption>;

const CalloutLayout = ({
  callout,
  children,
  onVisibilityChange,
  onCalloutEdit,
  onCalloutDelete,
  calloutNames,
  contributionsCount,
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

  const calloutNotOpenStateName = useMemo(() => {
    const state = callout?.state;

    if (!state || state === CalloutState.Open) {
      return undefined;
    }

    return t(`common.enums.callout-state.${state}` as const);
  }, [callout?.state, t]);

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
        <CalloutDetailsBar>
          <CalloutMisc>
            <CalloutDetails>
              <Box sx={{ background: 'grey', height: 20, width: 20 }} />
              <Caption>{`${'Author Name'} • ${t('callout.contributions', { count: contributionsCount })}`}</Caption>
            </CalloutDetails>
            <CalloutDate date={'99/99/9999'} />
          </CalloutMisc>
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
        </CalloutDetailsBar>
        <Box m={2} mt={1}>
          <TitleBar>
            <BlockTitle>{callout.displayName}</BlockTitle>
          </TitleBar>
          <Box sx={{ pt: gutters(), pb: gutters() }}>
            <WrapperMarkdown>{callout.description || ''}</WrapperMarkdown>
          </Box>
          {children}
        </Box>
        {calloutNotOpenStateName && (
          <CalloutBlockMarginal variant="footer">{calloutNotOpenStateName}</CalloutBlockMarginal>
        )}
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
