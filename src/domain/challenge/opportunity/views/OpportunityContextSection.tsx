import { FC } from 'react';
import ContextSection, { ContextSectionProps } from '../../../../common/components/composite/sections/ContextSection';

export interface OpportunityContextSectionProps extends Omit<ContextSectionProps, 'contextType'> {}

export const OpportunityContextSection: FC<OpportunityContextSectionProps> = ({ ...props }) => {
  return <ContextSection contextType="opportunity" {...props} />;
};
