import { Components, Theme } from '@mui/material/styles';
import MuiAvatar from './MuiAvatar';
import MuiButton from './MuiButton';
import MuiButtonBase from './MuiButtonBase';
import MuiChip from './MuiChip';
import MuiDialog from './MuiDialog';
import MuiDialogContent from './MuiDialogContent';
import MuiIcon from './MuiIcon';
import MuiLink from './MuiLInk';
import MuiTab from './MuiTab';

const componentsOverride = (theme: Theme): Components => ({
  MuiAvatar: MuiAvatar(theme),
  MuiButton: MuiButton(theme),
  MuiButtonBase: MuiButtonBase(theme),
  MuiChip: MuiChip(theme),
  MuiDialog: MuiDialog(theme),
  MuiDialogContent: MuiDialogContent(theme),
  MuiIcon: MuiIcon(theme),
  MuiLink: MuiLink(theme),
  MuiTab: MuiTab(theme),
});

export default componentsOverride;
