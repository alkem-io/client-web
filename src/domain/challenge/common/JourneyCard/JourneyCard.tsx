import React, { ComponentType, PropsWithChildren, ReactNode } from 'react';
import ContributeCard, { ContributeCardContainerProps } from '../../../../core/ui/card/ContributeCard';
import { Box, SvgIconProps } from '@mui/material';
import CardImage from '../../../../core/ui/card/CardImage';
import ItemView from '../../../../core/ui/list/ItemView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { GUTTER_PX } from '../../../../core/ui/grid/constants';
import CardContent from '../../../../core/ui/card/CardContent';
import { gutters } from '../../../../core/ui/grid/utils';
import RouterLink from '../../../../core/ui/link/RouterLink';

export interface JourneyCardProps extends ContributeCardContainerProps {
  iconComponent: ComponentType<SvgIconProps>;
  header: ReactNode;
  tagline: string;
  bannerUri: string;
  tags: string[];
  journeyUri: string;
}

const JourneyCard = ({
  iconComponent: Icon,
  header,
  tagline,
  bannerUri,
  tags,
  journeyUri,
  children,
  ...containerProps
}: PropsWithChildren<JourneyCardProps>) => {
  return (
    <ContributeCard {...containerProps}>
      <Box component={RouterLink} to={journeyUri}>
        <CardImage src={bannerUri} alt={tagline} />
        <ItemView
          visual={<RoundedIcon size="small" component={Icon} />}
          gap={1}
          height={gutters(3)}
          paddingY={1}
          paddingX={1.5}
        >
          {header}
        </ItemView>
      </Box>
      <CardContent flexGrow={1}>
        {children}
        <TagsComponent tags={tags} variant="filled" height={GUTTER_PX * 2.5} color="primary" marginTop={gutters()} />
      </CardContent>
    </ContributeCard>
  );
};

export default JourneyCard;
