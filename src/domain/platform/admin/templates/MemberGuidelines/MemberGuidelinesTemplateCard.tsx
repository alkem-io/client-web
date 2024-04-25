import React from 'react';
import { MemberGuidelinesIcon } from '../../../../collaboration/memberGuidelines/icon/MemberGuidelinesIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface MemberGuidelinesTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const MemberGuidelinesTemplateCard = (props: MemberGuidelinesTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={MemberGuidelinesIcon} />;
};

export default MemberGuidelinesTemplateCard;
