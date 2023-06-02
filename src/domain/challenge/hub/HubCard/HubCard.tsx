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
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';

export interface HubCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'expansion' | 'journeyTypeName'> {
  hubId?: string;
  displayName: string;
  vision: string;
  membersCount: number;
  hubVisibility?: HubVisibility;
}

const HubCard = ({ hubId, displayName, vision, membersCount, tagline, hubVisibility, ...props }: HubCardProps) => {
  const { t } = useTranslation();

  const { user } = useUserContext();

  const isMember = hubId ? user?.ofHub(hubId) : undefined;
  const ribbon =
    hubVisibility && hubVisibility !== HubVisibility.Active ? (
      <CardRibbon text={t(`common.enums.hub-visibility.${hubVisibility}` as const)} />
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
            {membersCount === 1
              ? t('community.members-count-one')
              : t('community.members-count', { count: membersCount })}
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
