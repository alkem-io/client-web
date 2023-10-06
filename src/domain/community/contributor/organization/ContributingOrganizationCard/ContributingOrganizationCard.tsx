import React from 'react';
import ContributorCard, { ContributorCardProps } from '../../ContributorCard/ContributorCard';
import CardMemberIcon from '../../../membership/CardMemberIcon/CardMemberIcon';

interface ContributingOrganizationCardProps extends ContributorCardProps {
  member?: boolean;
}

const ContributingOrganizationCard = ({ member, ...contributorCardProps }: ContributingOrganizationCardProps) => {
  return <ContributorCard bannerOverlay={member ? <CardMemberIcon /> : undefined} {...contributorCardProps} />;
};

export default ContributingOrganizationCard;
