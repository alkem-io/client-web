import { ComponentType, ReactNode } from 'react';
import { SvgIconProps } from '@mui/material';

export interface TemplateCardProps {
  url: string;
  linkState?: Record<string, unknown>;
  title: ReactNode;
  imageUrl: string | undefined;
  iconComponent: ComponentType<SvgIconProps>;
}
