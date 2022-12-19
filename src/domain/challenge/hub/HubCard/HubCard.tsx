import React from 'react';
import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import JourneyCard, { JourneyCardProps } from '../../common/JourneyCard/JourneyCard';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import JourneyCardTagline from '../../common/JourneyCard/JourneyCardTagline';

interface HubCardProps extends Omit<JourneyCardProps, 'header' | 'iconComponent'> {
  displayName: string;
  vision: string;
  membersCount: number;
}

const HubCard = ({ displayName, vision, membersCount, tagline, ...props }: HubCardProps) => {
  const { t } = useTranslation();

  return (
    <JourneyCard
      iconComponent={HubOutlined}
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
      <JourneyCardTagline>{vision}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default HubCard;
