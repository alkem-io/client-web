import React from 'react';
import { CommunityGuidelinesIcon } from '../../../../collaboration/communityGuidelines/icon/CommunityGuidelinesIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface CommunityGuidelinesTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const CommunityGuidelinesTemplateCard = (props: CommunityGuidelinesTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={CommunityGuidelinesIcon} />;
};

export default CommunityGuidelinesTemplateCard;
