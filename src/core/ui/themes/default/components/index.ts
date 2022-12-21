import { Components, Theme } from '@mui/material/styles';
import MuiAvatar from './MuiAvatar';
import MuiButton from './MuiButton';
import MuiButtonBase from './MuiButtonBase';
import MuiChip from './MuiChip';
import MuiDialog from './MuiDialog';
import MuiDialogContent from './MuiDialogContent';
import MuiIcon from './MuiIcon';
import MuiLink from './MuiLink';
import MuiPaper from './MuiPaper';
import MuiSkeleton from './MuiSkeleton';
import MuiTab from './MuiTab';
import MuiTabPanel from './MuiTabPanel';
import MuiSelect from './MuiSelect';
import MuiBottomNavigationAction from './MuiBottomNavigationAction';
// import type {} from '@mui/lab/themeAugmentation';

const componentsOverride: Components<Theme> = {
  MuiAvatar,
  MuiButton,
  MuiButtonBase,
  MuiChip,
  MuiDialog,
  MuiDialogContent,
  MuiIcon,
  MuiLink,
  MuiPaper,
  MuiTab,
  MuiSkeleton,
  MuiTabPanel,
  MuiSelect,
  MuiBottomNavigationAction,
};

export default componentsOverride;
