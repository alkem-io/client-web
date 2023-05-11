import React from 'react';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardTags from '../../../../core/ui/card/CardTags';
import CardFooter from '../../../../core/ui/card/CardFooter';
import InnovationPackIcon from '../InnovationPackIcon';
import CardFooterBadge from '../../../../core/ui/card/CardFooterBadge';

export interface InnovationPackCardProps {
  displayName: string;
  description: string | undefined;
  tags: string[] | undefined;
  providerAvatarUri: string | undefined;
  providerDisplayName: string | undefined;
  onClick?: () => void;
}

const InnovationPackCard = ({
  displayName,
  description,
  tags = [],
  providerDisplayName,
  providerAvatarUri,
  ...props
}: InnovationPackCardProps) => {
  return (
    <ContributeCard {...props}>
      <CardHeader title={displayName} iconComponent={InnovationPackIcon} />
      <CardDetails>
        <CardDescription>{description ?? ''}</CardDescription>
        <CardTags tags={tags} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardFooter>
        <CardFooterBadge avatarUri={providerAvatarUri}>{providerDisplayName}</CardFooterBadge>
      </CardFooter>
    </ContributeCard>
  );
};

export default InnovationPackCard;
