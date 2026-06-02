import { SvgIcon, type SvgIconProps } from '@mui/material';
import { ScanEye } from 'lucide-react';
import WhiteboardPreviewModeAutoSvg from './WhiteboardPreviewModeAuto.svg?react';
import WhiteboardPreviewModeCustomSvg from './WhiteboardPreviewModeCustom.svg?react';
import WhiteboardPreviewModeFixedSvg from './WhiteboardPreviewModeFixed.svg?react';

const WhiteboardPreviewSettingsIcon = (props: SvgIconProps) => <SvgIcon component={ScanEye} {...props} />;
WhiteboardPreviewSettingsIcon.muiName = 'WhiteboardPreviewSettings';

const WhiteboardPreviewModeAutoIcon = (props: SvgIconProps) => (
  <SvgIcon component={WhiteboardPreviewModeAutoSvg} inheritViewBox={true} {...props} />
);
WhiteboardPreviewModeAutoIcon.muiName = 'WhiteboardPreviewModeAuto';

const WhiteboardPreviewModeCustomIcon = (props: SvgIconProps) => (
  <SvgIcon component={WhiteboardPreviewModeCustomSvg} inheritViewBox={true} {...props} />
);
WhiteboardPreviewModeCustomIcon.muiName = 'WhiteboardPreviewModeCustom';

const WhiteboardPreviewModeFixedIcon = (props: SvgIconProps) => (
  <SvgIcon component={WhiteboardPreviewModeFixedSvg} inheritViewBox={true} {...props} />
);
WhiteboardPreviewModeFixedIcon.muiName = 'WhiteboardPreviewModeFixed';

export {
  WhiteboardPreviewSettingsIcon,
  WhiteboardPreviewModeAutoIcon,
  WhiteboardPreviewModeCustomIcon,
  WhiteboardPreviewModeFixedIcon,
};
