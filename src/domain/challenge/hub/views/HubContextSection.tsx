import { FC } from 'react';
import ContextSection, { ContextSectionProps } from '../../../../common/components/composite/sections/ContextSection';

export interface HubContextSectionProps extends Omit<ContextSectionProps, 'contextType'> {}

export const HubContextSection: FC<HubContextSectionProps> = ({ ...props }) => {
  return <ContextSection contextType="hub" {...props} />;
};
