import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { AspectIcon } from '../../aspect/icon/AspectIcon';
import { CanvasIcon } from '../../canvas/icon/CanvasIcon';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

const calloutIcons: Record<CalloutType, ComponentType<SvgIconProps>> = {
  [CalloutType.Card]: AspectIcon,
  [CalloutType.Canvas]: CanvasIcon,
  [CalloutType.Comments]: ForumOutlinedIcon,
};

export default calloutIcons;
