import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardImage from '../../../../core/ui/card/CardImage';
import ItemView from '../../../../core/ui/list/ItemView';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { BlockTitle, CardText } from '../../../../core/ui/typography';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import CardContent from '../../../../core/ui/card/CardContent';
import { ChallengeIcon } from '../icon/ChallengeIcon';

interface ChallengeCardProps {
  bannerUri: string;
  tagline: string;
  displayName: string;
  tags: string[];
}

const ChallengeCard = ({ bannerUri, tagline, displayName, tags }: ChallengeCardProps) => {
  return (
    <ContributeCard>
      <CardImage src={bannerUri} alt={tagline} />
      <CardContent>
        <ItemView visual={<RoundedIcon size="small" component={ChallengeIcon} />} gap={1} height={gutters(2)}>
          <BlockTitle component="div" sx={webkitLineClamp(2)}>
            {displayName}
          </BlockTitle>
        </ItemView>
        <CardText sx={webkitLineClamp(2)}>{tagline}</CardText>
        <TagsComponent tags={tags} variant="filled" minHeight={gutters()} color="primary" />
      </CardContent>
    </ContributeCard>
  );
};

export default ChallengeCard;
