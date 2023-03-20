import React, { PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IconButton, Menu } from '@mui/material';
import {
  Authorization,
  AuthorizationPrivilege,
  CalloutState,
  CalloutType,
  CalloutVisibility,
} from '../../../core/apollo/generated/graphql-schema';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import { CalloutSummary } from '../callout/CalloutSummary';
import CalloutVisibilityChangeDialog from '../callout/edit/visibility-change-dialog/CalloutVisibilityChangeDialog';
import CalloutEditDialog from '../callout/edit/edit-dialog/CalloutEditDialog';
import { CalloutEditType } from '../callout/edit/CalloutEditType';
import ShareButton from '../../shared/components/ShareDialog/ShareButton';
import { CalloutCanvasTemplate, CalloutCardTemplate } from '../callout/creation-dialog/CalloutCreationDialog';
import CalloutBlockMarginal from '../callout/Contribute/CalloutBlockMarginal';
import { BlockTitle } from '../../../core/ui/typography';
import { CalloutLayoutEvents, CalloutSortProps } from '../callout/Types';
import Gutters from '../../../core/ui/grid/Gutters';
import { useCalloutFormTemplatesFromHubLazyQuery } from '../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { Ribbon } from '../../../core/ui/card/Ribbon';
import Authorship from '../../../core/ui/authorship/Authorship';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import MenuItemWithIcon from '../../../core/ui/menu/MenuItemWithIcon';
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  CheckCircleOutlined,
  EditOutlined,
  UnpublishedOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@mui/icons-material';

export interface CalloutLayoutProps extends CalloutLayoutEvents, Partial<CalloutSortProps> {
  callout: {
    id: string;
    nameID: string;
    displayName: string;
    description: string;
    type: CalloutType;
    state: CalloutState;
    draft: boolean;
    editable?: boolean;
    authorization?: Authorization;
    url: string;
    cardTemplate?: CalloutCardTemplate;
    canvasTemplate?: CalloutCanvasTemplate;
    authorName?: string;
    authorAvatarUri?: string;
    publishedAt?: string;
  };
  calloutNames: string[];
  contributionsCount: number;
  actions?: ReactNode;
}

const CalloutLayout = ({
  callout,
  actions,
  children,
  onVisibilityChange,
  onCalloutEdit,
  onCalloutDelete,
  calloutNames,
  contributionsCount,
  topCallout,
  bottomCallout,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
}: PropsWithChildren<CalloutLayoutProps>) => {
  const { t } = useTranslation();

  const { hubNameId } = useUrlParams();
  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromHubLazyQuery();
  const getTemplates = () => fetchTemplates({ variables: { hubId: hubNameId! } });

  const cardTemplates = templatesData?.hub.templates?.aspectTemplates ?? [];
  const canvasTemplates = templatesData?.hub.templates?.canvasTemplates ?? [];
  const templates = { cardTemplates, canvasTemplates };

  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);
  const handleSettingsOpened = (event: React.MouseEvent<HTMLElement>) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);

  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const handleVisibilityDialogOpen = () => {
    setVisibilityDialogOpen(true);
    setSettingsAnchorEl(null);
  };
  const visDialogTitle = useMemo(
    () => `${t(`buttons.${callout.draft ? '' : 'un'}publish` as const)} ${t('common.callout')}`,
    [callout.draft, t]
  );
  const handleVisibilityChange = async (visibility: CalloutVisibility) => {
    await onVisibilityChange(callout.id, visibility);
    setVisibilityDialogOpen(false);
  };
  const [editDialogOpened, setEditDialogOpened] = useState(false);
  const handleEditDialogOpen = () => {
    getTemplates();
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

    return t('callout.closed');
  }, [callout?.state, t]);

  const dontShow = callout.draft && !callout?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);

  if (dontShow) {
    return null;
  }

  const hasCalloutDetails = callout.authorName && callout.publishedAt;

  const handleMove = (callback?: (id: string) => void) => () => {
    handleSettingsClose();
    callback?.(callout.id);
  };

  return (
    <>
      {callout.draft && (
        <Ribbon>
          <BlockTitle textAlign="center">{t('callout.draftNotice')}</BlockTitle>
        </Ribbon>
      )}
      <DialogHeader
        actions={
          <>
            {actions}
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
          </>
        }
      >
        {hasCalloutDetails && (
          <Authorship authorAvatarUri={callout.authorAvatarUri} date={callout.publishedAt}>
            {`${callout.authorName} • ${t('callout.contributions', {
              count: contributionsCount,
            })}`}
          </Authorship>
        )}
        {!hasCalloutDetails && <BlockTitle noWrap>{callout.displayName}</BlockTitle>}
      </DialogHeader>
      <Gutters minHeight={0} paddingTop={0}>
        {hasCalloutDetails && <BlockTitle>{callout.displayName}</BlockTitle>}
        <WrapperMarkdown>{callout.description ?? ''}</WrapperMarkdown>
        {children}
      </Gutters>
      {calloutNotOpenStateName && (
        <CalloutBlockMarginal variant="footer">{calloutNotOpenStateName}</CalloutBlockMarginal>
      )}
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
      >
        <MenuItemWithIcon iconComponent={EditOutlined} onClick={handleEditDialogOpen}>
          {t('buttons.edit')}
        </MenuItemWithIcon>
        <MenuItemWithIcon
          iconComponent={callout.draft ? CheckCircleOutlined : UnpublishedOutlined}
          onClick={handleVisibilityDialogOpen}
        >
          {t(`buttons.${callout.draft ? '' : 'un'}publish` as const)}
        </MenuItemWithIcon>
        <MenuItemWithIcon iconComponent={ArrowUpwardOutlined} onClick={handleMove(onMoveUp)} disabled={topCallout}>
          {t('buttons.moveUp')}
        </MenuItemWithIcon>
        <MenuItemWithIcon
          iconComponent={ArrowDownwardOutlined}
          onClick={handleMove(onMoveDown)}
          disabled={bottomCallout}
        >
          {t('buttons.moveDown')}
        </MenuItemWithIcon>
        <MenuItemWithIcon
          iconComponent={VerticalAlignTopOutlined}
          onClick={handleMove(onMoveToTop)}
          disabled={topCallout}
        >
          {t('buttons.moveToTop')}
        </MenuItemWithIcon>
        <MenuItemWithIcon
          iconComponent={VerticalAlignBottomOutlined}
          onClick={handleMove(onMoveToBottom)}
          disabled={bottomCallout}
        >
          {t('buttons.moveToBottom')}
        </MenuItemWithIcon>
      </Menu>
      <CalloutVisibilityChangeDialog
        open={visibilityDialogOpen}
        onClose={() => setVisibilityDialogOpen(false)}
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
        templates={templates}
      />
    </>
  );
};

export default CalloutLayout;
