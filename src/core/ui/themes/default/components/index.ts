import type { Components, Theme } from '@mui/material/styles';
import MuiAvatar from './MuiAvatar';
import MuiBottomNavigationAction from './MuiBottomNavigationAction';
import MuiButton from './MuiButton';
import MuiButtonBase from './MuiButtonBase';
import MuiChip from './MuiChip';
import MuiDialog from './MuiDialog';
import MuiDialogActions from './MuiDialogActions';
import MuiDialogContent from './MuiDialogContent';
import MuiFormHelperText from './MuiFormHelperText';
import MuiIcon from './MuiIcon';
import MuiLink from './MuiLink';
import MuiMenuItem from './MuiMenuItem';
import MuiPaper from './MuiPaper';
import MuiSelect from './MuiSelect';
import MuiSkeleton from './MuiSkeleton';
import MuiTab from './MuiTab';

const componentsOverride: Components<Theme> = {
  MuiAvatar,
  MuiButton,
  MuiButtonBase,
  MuiChip,
  MuiDialog,
  MuiDialogContent,
  MuiDialogActions,
  MuiIcon,
  MuiLink,
  MuiMenuItem,
  MuiPaper,
  MuiTab,
  MuiSkeleton,
  MuiSelect,
  MuiBottomNavigationAction,
  MuiFormHelperText,
};

export default componentsOverride;
