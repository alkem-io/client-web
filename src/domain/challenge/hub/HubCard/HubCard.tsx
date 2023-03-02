import React from 'react';
import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import JourneyCard, { JourneyCardProps } from '../../common/JourneyCard/JourneyCard';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import JourneyCardTagline from '../../common/JourneyCard/JourneyCardTagline';
import JourneyCardDescription from '../../common/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../../common/JourneyCard/JourneyCardSpacing';
import { useUserContext } from '../../../community/contributor/user';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import CardRibbon from '../../../../core/ui/card/CardRibbon';

export interface HubCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'expansion' | 'journeyTypeName'> {
  hubId?: string;
  displayName: string;
  vision: string;
  membersCount: number;
  isDemoHub?: boolean;
}

const HubCard = ({ hubId, displayName, vision, membersCount, tagline, isDemoHub, ...props }: HubCardProps) => {
  const { t } = useTranslation();

  const { user } = useUserContext();

  const isMember = hubId ? user?.ofHub(hubId) : undefined;
  const ribbon = isDemoHub ? (
    <CardRibbon text={`${t('common.enums.hub-visibility.DEMO')} ${t('common.hub')}`} />
  ) : undefined;

  return (
    <JourneyCard
      iconComponent={HubOutlined}
      tagline={tagline}
      member={isMember}
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
          <JourneyCardDescription>{vision}</JourneyCardDescription>
          <JourneyCardSpacing />
        </>
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName="hub" />
        </CardActions>
      }
      ribbon={ribbon}
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default HubCard;
