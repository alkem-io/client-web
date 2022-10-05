import { FC } from 'react';
import ContextSection, { ContextSectionProps } from '../../../../common/components/composite/sections/ContextSection';

export interface ChallengeContextSectionProps extends Omit<ContextSectionProps, 'contextType'> {}

export const ChallengeContextSection: FC<ChallengeContextSectionProps> = ({ ...props }) => {
  return <ContextSection contextType="challenge" {...props} />;
};
