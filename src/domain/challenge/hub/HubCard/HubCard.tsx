import React from 'react';
import { useTranslation } from 'react-i18next';
import JourneyCard, { JourneyCardProps } from '../../common/JourneyCard/JourneyCard';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import JourneyCardTagline from '../../common/JourneyCard/JourneyCardTagline';

interface HubCardProps extends Omit<JourneyCardProps, 'header'> {
  displayName: string;
  membersCount: number;
}

const HubCard = ({ displayName, membersCount, tagline, ...props }: HubCardProps) => {
  const { t } = useTranslation();

  return (
    <JourneyCard
      tagline={tagline}
      header={
        <>
          <BlockTitle noWrap component="dt">
            {displayName}
          </BlockTitle>
          <Caption noWrap component="dd">
            {t('community.members-count', { count: membersCount })}
          </Caption>
        </>
      }
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default HubCard;
