import { CardContent, Skeleton } from '@mui/material';
import { FC } from 'react';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardImage from '../../../../core/ui/card/CardImage';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../core/ui/typography/components';
import { InnovationPackIcon } from '../../../platform/admin/templates/InnovationPacks/InnovationPackIcon';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { AspectIcon } from '../icon/AspectIcon';
import { PostTemplate } from './PostTemplate';

interface PostTemplateCardProps extends TemplateCardBaseProps<PostTemplate> {}

const PostTemplateCard: FC<PostTemplateCardProps> = ({ template, loading, onClick }) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.displayName} iconComponent={AspectIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={template?.provider?.avatarUri}>
          {template?.provider?.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardContent>{template?.description}</CardContent>
      <CardImage src={template?.visualUri} alt={template?.displayName} defaultImage={<AspectIcon />} />
      {template?.innovationPack.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{template?.innovationPack.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default PostTemplateCard;
