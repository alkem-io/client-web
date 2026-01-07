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
  VideocamOutlined,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { InnovationFlowIcon } from '@/domain/collaboration/InnovationFlow/InnovationFlowIcon/InnovationFlowIcon';
import FullWidthButton from '@/core/ui/button/FullWidthButton';
import { MENU_STATE_KEY, MenuState } from '../../layout/SubspaceInfoColumn';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import { Caption } from '@/core/ui/typography';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

const ACTION_CONFIG = {
  [SubspaceDialog.About]: InfoOutlined,
  [SubspaceDialog.Outline]: AccountTreeOutlined,
  [SubspaceDialog.Index]: ListOutlined,
  [SubspaceDialog.Subspaces]: SegmentOutlined,
  [SubspaceDialog.Contributors]: GroupsOutlined,
  [SubspaceDialog.VideoCall]: VideocamOutlined,
  [SubspaceDialog.Activity]: HistoryOutlined,
  [SubspaceDialog.Timeline]: CalendarMonthOutlined,
  [SubspaceDialog.Share]: ShareOutlined,
  [SubspaceDialog.ManageFlow]: InnovationFlowIcon,
  [SubspaceDialog.Settings]: SettingsOutlined,
  [SubspaceDialog.Updates]: SettingsOutlined,
};
export const DialogActionButton = ({
  dialog,
  actionDisplay = 'buttonWithTooltip',
  buttonVariant = 'contained',
  onClick,
}: {
  dialog: SubspaceDialog;
  dialogProps?: Record<string, unknown>;
  actionDisplay?: 'fullWidth' | 'buttonWithTooltip' | 'menuItem';
  buttonVariant?: 'text' | 'contained' | 'outlined';
  onClick?: () => void;
}) => {
  const { t } = useTranslation();

  const {
    subspace: {
      about: {
        profile: { url },
      },
    },
  } = useSubSpace();

  const Icon = ACTION_CONFIG[dialog];

  // calendar, event and timeline are used all over the place so hacking it together for now
  let tooltipKey: TranslationKey = `spaceDialog.${dialog}` as const;
  if (dialog === SubspaceDialog.Timeline) {
    tooltipKey = 'spaceDialog.events';
  }
  const tooltip = t(tooltipKey);

  const isCollapsed = localStorage.getItem(MENU_STATE_KEY) === MenuState.COLLAPSED || false;
  return (
    <>
      {actionDisplay === 'menuItem' ? (
        <NavigatableMenuItem
          key={dialog}
          iconComponent={Icon}
          route={`${url}/${dialog}`}
          replace
          onClick={onClick}
          typographyComponent={props => <Caption {...props} />}
        >
          {tooltip}
        </NavigatableMenuItem>
      ) : (
        <Link to={`${url}/${dialog}`} replace style={{ minWidth: 0 }}>
          {actionDisplay === 'fullWidth' ? (
            <FullWidthButton
              startIcon={<Icon />}
              variant="outlined"
              sx={{ '&:hover': { color: theme => theme.palette.common.white } }}
            >
              {tooltip}
            </FullWidthButton>
          ) : (
            <ButtonWithTooltip
              variant={isCollapsed ? 'text' : buttonVariant}
              tooltip={tooltip}
              tooltipPlacement={isCollapsed ? 'right' : 'bottom'}
              sx={{ maxWidth: '100%', width: '100%' }}
              iconButton
            >
              <Icon />
            </ButtonWithTooltip>
          )}
        </Link>
      )}
    </>
  );
};
