import React, { PropsWithChildren, ReactNode } from 'react';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardImage from '../../../../core/ui/card/CardImage';
import ItemView from '../../../../core/ui/list/ItemView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { HubOutlined } from '@mui/icons-material';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import CardContent from '../../../../core/ui/card/CardContent';
import { GUTTER_PX } from '../../../../core/ui/grid/constants';

export interface JourneyCardProps {
  header: ReactNode;
  tagline: string;
  bannerUri: string;
  tags: string[];
}

const JourneyCard = ({ header, tagline, bannerUri, tags, children }: PropsWithChildren<JourneyCardProps>) => {
  return (
    <ContributeCard>
      <CardImage src={bannerUri} alt={tagline} />
      <CardContent flexGrow={1}>
        <ItemView visual={<RoundedIcon size="small" component={HubOutlined} />} gap={1}>
          {header}
        </ItemView>
        {children}
        <TagsComponent tags={tags} variant="filled" height={GUTTER_PX * 2.5} color="primary" />
      </CardContent>
    </ContributeCard>
  );
};

export default JourneyCard;
