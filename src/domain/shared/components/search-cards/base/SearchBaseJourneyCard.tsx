import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CardActions from '../../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../../../journey/common/JourneyCard/JourneyCardGoToButton';
import { JourneyTypeName } from '../../../../journey/JourneyTypeName';
import journeyIcon from '../../JourneyIcon/JourneyIcon';
import JourneyCard, { JourneyCardProps } from '../../../../journey/common/JourneyCard/JourneyCard';
import JourneyCardTagline from '../../../../journey/common/JourneyCard/JourneyCardTagline';
import { BlockTitle } from '../../../../../core/ui/typography/components';
import webkitLineClamp from '../../../../../core/ui/utils/webkitLineClamp';
import JourneyCardDescription from '../../../../journey/common/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../../../../journey/common/JourneyCard/JourneyCardSpacing';
import { SpaceVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import CardRibbon from '../../../../../core/ui/card/CardRibbon';

export interface SearchBaseJourneyCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'parentSegment'> {
  tagline: string;
  locked?: boolean;
  journeyTypeName: JourneyTypeName;
  displayName: string;
  vision: string;
  parentSegment?: ReactNode;
  spaceLicense?: SpaceVisibility;
  journeyUri: string;
}

const SearchBaseJourneyCard = ({
  journeyTypeName,
  tagline,
  displayName,
  vision,
  parentSegment,
  spaceLicense,
  ...props
}: SearchBaseJourneyCardProps) => {
  const { t } = useTranslation();
  const ribbon =
    spaceLicense && spaceLicense !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceLicense}` as const)} />
    ) : undefined;

  return (
    <JourneyCard
      iconComponent={journeyIcon[journeyTypeName]}
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      ribbon={ribbon}
      expansion={<JourneyCardDescription>{vision}</JourneyCardDescription>}
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName={journeyTypeName} />
        </CardActions>
      }
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
      {parentSegment ?? <JourneyCardSpacing height={2} />}
    </JourneyCard>
  );
};

export default SearchBaseJourneyCard;
