import { Components, Theme } from '@mui/material/styles';
import MuiAvatar from './MuiAvatar';
import MuiButton from './MuiButton';
import MuiButtonBase from './MuiButtonBase';
import MuiChip from './MuiChip';
import MuiDialog from './MuiDialog';
import MuiDialogContent from './MuiDialogContent';
import MuiIcon from './MuiIcon';
import MuiLink from './MuiLInk';
import MuiPaper from './MuiPaper';
import MuiSkeleton from './MuiSkeleton';
import MuiTab from './MuiTab';
import MuiTabPanel from './MuiTabPanel';
import MuiSelect from './MuiSelect';
import type {} from '@mui/lab/themeAugmentation';

const componentsOverride = (theme: Theme): Components => ({
  MuiAvatar: MuiAvatar(theme),
  MuiButton: MuiButton(theme),
  MuiButtonBase: MuiButtonBase(theme),
  MuiChip: MuiChip(theme),
  MuiDialog: MuiDialog(theme),
  MuiDialogContent: MuiDialogContent(theme),
  MuiIcon: MuiIcon(theme),
  MuiLink: MuiLink(theme),
  MuiPaper: MuiPaper(theme),
  MuiTab: MuiTab(theme),
  MuiSkeleton: MuiSkeleton(theme),
  MuiTabPanel: MuiTabPanel(theme),
  MuiSelect: MuiSelect(theme),
});

export default componentsOverride;
