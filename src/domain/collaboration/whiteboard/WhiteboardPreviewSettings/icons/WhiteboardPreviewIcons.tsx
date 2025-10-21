import { SvgIcon, SvgIconProps } from '@mui/material';

import WhiteboardPreviewSettingsSvg from './WhiteboardPreviewSettings.svg?react';
import WhiteboardPreviewModeAutoSvg from './WhiteboardPreviewModeAuto.svg?react';
import WhiteboardPreviewModeCustomSvg from './WhiteboardPreviewModeCustom.svg?react';

const WhiteboardPreviewSettingsIcon = (props: SvgIconProps) => (
  <SvgIcon component={WhiteboardPreviewSettingsSvg} inheritViewBox {...props} />
);
WhiteboardPreviewSettingsIcon.muiName = 'WhiteboardPreviewSettings';

const WhiteboardPreviewModeAutoIcon = (props: SvgIconProps) => (
  <SvgIcon component={WhiteboardPreviewModeAutoSvg} inheritViewBox {...props} />
);
WhiteboardPreviewModeAutoIcon.muiName = 'WhiteboardPreviewModeAuto';

const WhiteboardPreviewModeCustomIcon = (props: SvgIconProps) => (
  <SvgIcon component={WhiteboardPreviewModeCustomSvg} inheritViewBox {...props} />
);
WhiteboardPreviewModeCustomIcon.muiName = 'WhiteboardPreviewModeCustom';

export { WhiteboardPreviewSettingsIcon, WhiteboardPreviewModeAutoIcon, WhiteboardPreviewModeCustomIcon };
