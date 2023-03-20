import { Components, Theme } from '@mui/material/styles';
import MuiAvatar from './MuiAvatar';
import MuiButton from './MuiButton';
import MuiButtonBase from './MuiButtonBase';
import MuiChip from './MuiChip';
import MuiDialog from './MuiDialog';
import MuiDialogContent from './MuiDialogContent';
import MuiIcon from './MuiIcon';
import MuiLink from './MuiLink';
import MuiMenuItem from './MuiMenuItem';
import MuiPaper from './MuiPaper';
import MuiSkeleton from './MuiSkeleton';
import MuiTab from './MuiTab';
import MuiTabPanel from './MuiTabPanel';
import MuiSelect from './MuiSelect';
import MuiBottomNavigationAction from './MuiBottomNavigationAction';
import MuiFormHelperText from './MuiFormHelperText';

const componentsOverride: Components<Theme> = {
  MuiAvatar,
  MuiButton,
  MuiButtonBase,
  MuiChip,
  MuiDialog,
  MuiDialogContent,
  MuiIcon,
  MuiLink,
  MuiMenuItem,
  MuiPaper,
  MuiTab,
  MuiSkeleton,
  MuiTabPanel,
  MuiSelect,
  MuiBottomNavigationAction,
  MuiFormHelperText,
};

export default componentsOverride;
