import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardImage from '../../../../core/ui/card/CardImage';
import ItemView from '../../../../core/ui/list/ItemView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { HubOutlined } from '@mui/icons-material';
import { CardText, BlockTitle, Caption } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import CardContent from '../../../../core/ui/card/CardContent';

interface HubCardProps {
  bannerUri: string;
  tagline: string;
  displayName: string;
  tags: string[];
  membersCount: number;
}

const HubCard = ({ bannerUri, tagline, displayName, tags, membersCount }: HubCardProps) => {
  const { t } = useTranslation();

  return (
    <ContributeCard>
      <CardImage src={bannerUri} alt={tagline} />
      <CardContent>
        <ItemView visual={<RoundedIcon size="small" component={HubOutlined} />} gap={1}>
          <BlockTitle noWrap component="dt">
            {displayName}
          </BlockTitle>
          <Caption noWrap component="dd">
            {t('community.members-count', { count: membersCount })}
          </Caption>
        </ItemView>
        <CardText sx={webkitLineClamp(2)}>{tagline}</CardText>
        <TagsComponent tags={tags} variant="filled" minHeight={gutters()} color="primary" />
      </CardContent>
    </ContributeCard>
  );
};

export default HubCard;
