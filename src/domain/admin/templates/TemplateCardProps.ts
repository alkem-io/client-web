import { ReactNode } from 'react';

export interface TemplateCardProps {
  url: string;
  linkState?: Record<string, unknown>;
  title: ReactNode;
  hasImage?: boolean;
}
