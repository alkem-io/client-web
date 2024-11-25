import ContributorCard, { ContributorCardProps } from '@/domain/community/contributor/ContributorCard/ContributorCard';
import CardMemberIcon from '@/domain/community/membership/CardMemberIcon/CardMemberIcon';

interface ContributingOrganizationCardProps extends ContributorCardProps {
  member?: boolean;
}

const ContributingOrganizationCard = ({ member, ...contributorCardProps }: ContributingOrganizationCardProps) => (
  <ContributorCard bannerOverlay={member ? <CardMemberIcon /> : undefined} {...contributorCardProps} />
);

export default ContributingOrganizationCard;
