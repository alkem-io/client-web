import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, IconButton, Menu } from '@mui/material';
import {
  Authorization,
  AuthorizationPrivilege,
  CalloutState,
  CalloutType,
  CalloutVisibility,
  ContributeTabPostFragment,
  MessageDetailsFragment,
  WhiteboardDetailsFragment,
} from '../../../core/apollo/generated/graphql-schema';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import { CalloutSummary } from '../callout/CalloutSummary';
import CalloutVisibilityChangeDialog from '../callout/edit/visibilityChangeDialog/CalloutVisibilityChangeDialog';
import CalloutEditDialog from '../callout/edit/editDialog/CalloutEditDialog';
import { CalloutEditType } from '../callout/edit/CalloutEditType';
import ShareButton from '../../shared/components/ShareDialog/ShareButton';
import CalloutBlockMarginal from '../callout/Contribute/CalloutBlockMarginal';
import { BlockTitle } from '../../../core/ui/typography';
import { CalloutLayoutEvents, CalloutSortProps } from '../callout/CalloutViewTypes';
import Gutters from '../../../core/ui/grid/Gutters';
import { useCalloutFormTemplatesFromSpaceLazyQuery } from '../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { Ribbon } from '../../../core/ui/card/Ribbon';
import Authorship from '../../../core/ui/authorship/Authorship';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import MenuItemWithIcon from '../../../core/ui/menu/MenuItemWithIcon';
import {
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
  CheckCircleOutlined,
  Close,
  EditOutlined,
  UnpublishedOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@mui/icons-material';
import { ExpandContentIcon } from '../../../core/ui/content/ExpandContent';
import { Reference, Tagset } from '../../common/profile/Profile';
import References from '../../shared/components/References/References';
import TagsComponent from '../../shared/components/TagsComponent/TagsComponent';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import { WhiteboardFragmentWithCallout, WhiteboardRtFragmentWithCallout } from '../callout/useCallouts/useCallouts';

export interface CalloutLayoutProps extends CalloutLayoutEvents, Partial<CalloutSortProps> {
  callout: {
    id: string;
    nameID: string;
    framing: {
      profile: {
        id: string;
        displayName: string;
        description?: string;
        references?: Reference[];
        tagset?: Tagset;
        displayLocationTagset?: Tagset;
        storageBucket: {
          id: string;
        };
      };
      whiteboard: WhiteboardFragmentWithCallout;
      whiteboardRt: WhiteboardRtFragmentWithCallout;
    };
    comments?: {
      messages: MessageDetailsFragment[] | undefined;
    };
    type: CalloutType;
    contributionPolicy: {
      state: CalloutState;
    };
    contributionDefaults: {
      postDescription?: string;
      whiteboardContent?: string;
    };
    contributions?: {
      link?: Reference;
      post?: ContributeTabPostFragment;
      whiteboard?: WhiteboardDetailsFragment;
    }[];
    draft: boolean;
    editable?: boolean;
    authorization?: Authorization;
    authorName?: string;
    authorAvatarUri?: string;
    publishedAt?: string;
  };
  calloutNames: string[];
  contributionsCount: number;
  expanded?: boolean;
  calloutUri: string;
  onExpand?: () => void;
  onClose?: () => void;
  skipReferences?: boolean;
  disableMarginal?: boolean;
  journeyTypeName: JourneyTypeName;
}

const CalloutLayout = ({
  callout,
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
  calloutUri,
  expanded = false,
  onExpand,
  onClose,
  skipReferences,
  disableMarginal = false,
  journeyTypeName,
}: PropsWithChildren<CalloutLayoutProps>) => {
  const { t } = useTranslation();

  const { spaceNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  const [fetchTemplates, { data: templatesData }] = useCalloutFormTemplatesFromSpaceLazyQuery();
  const getTemplates = () => fetchTemplates({ variables: { spaceId: spaceNameId! } });

  const postTemplates = templatesData?.space.templates?.postTemplates ?? [];
  const whiteboardTemplates = templatesData?.space.templates?.whiteboardTemplates ?? [];
  const templates = { postTemplates, whiteboardTemplates };

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
  const handleVisibilityChange = async (visibility: CalloutVisibility, sendNotification: boolean) => {
    await onVisibilityChange(callout.id, visibility, sendNotification);
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
    const state = callout?.contributionPolicy.state;

    if (!state || state === CalloutState.Open || disableMarginal) {
      return undefined;
    }

    if (!callout?.comments?.messages?.length) {
      return;
    }

    return t('callout.closed');
  }, [callout?.contributionPolicy.state, callout?.comments?.messages, t]);

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
            <IconButton onClick={expanded ? onClose : onExpand}>
              {expanded ? <Close /> : <ExpandContentIcon />}
            </IconButton>
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
            <ShareButton url={calloutUri} entityTypeName="callout" />
          </>
        }
        titleContainerProps={{ flexDirection: 'column' }}
      >
        {hasCalloutDetails && (
          <Authorship authorAvatarUri={callout.authorAvatarUri} date={callout.publishedAt}>
            {`${callout.authorName} • ${t('callout.contributions', {
              count: contributionsCount,
            })}`}
          </Authorship>
        )}
        {!hasCalloutDetails && <BlockTitle noWrap>{callout.framing.profile.displayName}</BlockTitle>}
      </DialogHeader>
      <Gutters minHeight={0} paddingTop={0}>
        {hasCalloutDetails && <BlockTitle>{callout.framing.profile.displayName}</BlockTitle>}
        <Box sx={{ wordWrap: 'break-word' }}>
          <WrapperMarkdown>{callout.framing.profile.description ?? ''}</WrapperMarkdown>
        </Box>
        {!skipReferences && <References compact references={callout.framing.profile.references} />}
        {callout.framing.profile.tagset?.tags && callout.framing.profile.tagset?.tags.length > 0 ? (
          <TagsComponent tags={callout.framing.profile.tagset?.tags} />
        ) : undefined}
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
        <MenuItemWithIcon key="edit" iconComponent={EditOutlined} onClick={handleEditDialogOpen}>
          {t('buttons.edit')}
        </MenuItemWithIcon>
        <MenuItemWithIcon
          key="publish"
          iconComponent={callout.draft ? CheckCircleOutlined : UnpublishedOutlined}
          onClick={handleVisibilityDialogOpen}
        >
          {t(`buttons.${callout.draft ? '' : 'un'}publish` as const)}
        </MenuItemWithIcon>
        {!expanded && [
          /* Put MenuItems into an array to avoid a weird warning from MUI
          https://stackoverflow.com/questions/75083605/mui-the-menu-component-doesnt-accept-a-fragment-as-a-child-consider-providing */
          <MenuItemWithIcon
            key="moveUp"
            iconComponent={ArrowUpwardOutlined}
            onClick={handleMove(onMoveUp)}
            disabled={topCallout}
          >
            {t('buttons.moveUp')}
          </MenuItemWithIcon>,
          <MenuItemWithIcon
            key="moveDown"
            iconComponent={ArrowDownwardOutlined}
            onClick={handleMove(onMoveDown)}
            disabled={bottomCallout}
          >
            {t('buttons.moveDown')}
          </MenuItemWithIcon>,
          <MenuItemWithIcon
            key="moveToTop"
            iconComponent={VerticalAlignTopOutlined}
            onClick={handleMove(onMoveToTop)}
            disabled={topCallout}
          >
            {t('buttons.moveToTop')}
          </MenuItemWithIcon>,
          <MenuItemWithIcon
            key="moveToBottom"
            iconComponent={VerticalAlignBottomOutlined}
            onClick={handleMove(onMoveToBottom)}
            disabled={bottomCallout}
          >
            {t('buttons.moveToBottom')}
          </MenuItemWithIcon>,
        ]}
      </Menu>
      <CalloutVisibilityChangeDialog
        open={visibilityDialogOpen}
        onClose={() => setVisibilityDialogOpen(false)}
        title={visDialogTitle}
        callout={callout}
        onVisibilityChanged={handleVisibilityChange}
      >
        <CalloutSummary callout={callout} />
      </CalloutVisibilityChangeDialog>
      <CalloutEditDialog
        open={editDialogOpened}
        onClose={handleEditDialogClosed}
        calloutType={callout.type}
        callout={callout}
        onCalloutEdit={handleCalloutEdit}
        onDelete={onCalloutDelete}
        canChangeCalloutLocation
        calloutNames={calloutNames}
        templates={templates}
        journeyTypeName={journeyTypeName}
      />
    </>
  );
};

export default CalloutLayout;
