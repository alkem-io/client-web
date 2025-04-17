import RouterLink from '@/core/ui/link/RouterLink';
import ButtonWithTooltip from '@/core/ui/button/ButtonWithTooltip';
import { SubspaceDialog } from './SubspaceDialog';
import {
  AccountTreeOutlined,
  CalendarMonthOutlined,
  GroupsOutlined,
  HistoryOutlined,
  InfoOutlined,
  ListOutlined,
  SegmentOutlined,
  SettingsOutlined,
  ShareOutlined,
} from '@mui/icons-material';
import { TFuncKey, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import CalloutsListDialog from '@/domain/collaboration/callout/calloutsList/CalloutsListDialog';
import SubspacesListDialog from '../SubspacesListDialog';
import ContributorsToggleDialog from '../ContributorsToggleDialog';
import ActivityDialog from '../Activity/ActivityDialog';
import CalendarDialog from '@/domain/timeline/calendar/CalendarDialog';
import { ShareDialog } from '@/domain/shared/components/ShareDialog/ShareDialog';
import InnovationFlowSettingsDialog from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { InnovationFlowIcon } from '@/domain/collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import { useBackToStaticPath } from '@/core/routing/useBackToPath';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
enum MenuState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
}
const MENU_STATE_KEY = 'menuState';
const ACTION_CONFIG = {
  [SubspaceDialog.About]: { Icon: InfoOutlined, Dialog: null },
  [SubspaceDialog.Outline]: { Icon: AccountTreeOutlined, Dialog: CalloutsListDialog },
  [SubspaceDialog.Index]: {
    Icon: ListOutlined,
    Dialog: CalloutsListDialog,
  },
  [SubspaceDialog.Subspaces]: { Icon: SegmentOutlined, Dialog: SubspacesListDialog },
  [SubspaceDialog.Contributors]: { Icon: GroupsOutlined, Dialog: ContributorsToggleDialog },
  [SubspaceDialog.Activity]: { Icon: HistoryOutlined, Dialog: ActivityDialog },
  [SubspaceDialog.Timeline]: { Icon: CalendarMonthOutlined, Dialog: CalendarDialog },
  [SubspaceDialog.Share]: { Icon: ShareOutlined, Dialog: ShareDialog },
  [SubspaceDialog.ManageFlow]: { Icon: InnovationFlowIcon, Dialog: InnovationFlowSettingsDialog },
  [SubspaceDialog.Settings]: { Icon: SettingsOutlined, Dialog: InnovationFlowSettingsDialog },
};
export const DialogAction = ({
  dialog,
  dialogProps = {},
  fullWidth = false,
  buttonVariant = 'contained',
}: {
  dialog: SubspaceDialog;
  dialogProps?: Record<string, unknown>;
  fullWidth?: boolean;
  buttonVariant?: 'text' | 'contained' | 'outlined';
}) => {
  const { t } = useTranslation();

  const bal = useParams();
  const { dialog: currentDialog } = bal;

  const {
    subspace: {
      about: {
        profile: { url },
      },
    },
  } = useSubSpace();
  const handleClose = useBackToStaticPath(url ?? '');
  if (ACTION_CONFIG[dialog] === undefined) {
    console.warn(`DialogAction: No action config found for dialog ${dialog}`);
    return null;
  }

  const { Icon, Dialog } = ACTION_CONFIG[dialog];

  // calendar, event and timeline are used all over the place so hacking it together for now
  let tooltipKey: string = dialog;
  if (dialog === SubspaceDialog.Timeline) {
    tooltipKey = 'events';
  }
  const tooltip = t(`spaceDialog.${tooltipKey}` as TFuncKey) as string;

  const isCollapsed = localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false;
  return (
    <>
      <Link to={`${url}/${dialog}`}>
        {fullWidth ? (
          <FullWidthButton
            startIcon={<InfoOutlined />}
            // onClick={() => setAboutDialogOpen(true)}
            variant="outlined"
            sx={{ '&:hover': { color: theme => theme.palette.common.white } }}
          >
            {/* {t('common.aboutThis', { entity: translatedSpaceLevel })} */}
            {tooltip}
          </FullWidthButton>
        ) : (
          <ButtonWithTooltip
            variant={isCollapsed ? 'text' : buttonVariant}
            tooltip={tooltip}
            tooltipPlacement={isCollapsed ? 'right' : 'bottom'}
            sx={{ maxWidth: '100%' }}
            iconButton
          >
            <Icon />
          </ButtonWithTooltip>
        )}
      </Link>
      {dialog === currentDialog && Dialog && <Dialog open onClose={handleClose} {...dialogProps} />}
    </>
  );
};
