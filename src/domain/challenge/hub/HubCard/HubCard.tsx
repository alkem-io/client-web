import React from 'react';
import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import JourneyCard, { JourneyCardProps } from '../../common/JourneyCard/JourneyCard';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import JourneyCardTagline from '../../common/JourneyCard/JourneyCardTagline';
import JourneyCardVision from '../../common/JourneyCard/JourneyCardVision';
import JourneyCardSpacing from '../../common/JourneyCard/JourneyCardSpacing';

interface HubCardProps extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'expansion' | 'journeyTypeName'> {
  displayName: string;
  vision: string;
  membersCount: number;
}

const HubCard = ({ displayName, vision, membersCount, tagline, ...props }: HubCardProps) => {
  const { t } = useTranslation();

  return (
    <JourneyCard
      iconComponent={HubOutlined}
      journeyTypeName="hub"
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
      expansion={
        <>
          <JourneyCardVision>{vision}</JourneyCardVision>
          <JourneyCardSpacing />
        </>
      }
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default HubCard;
