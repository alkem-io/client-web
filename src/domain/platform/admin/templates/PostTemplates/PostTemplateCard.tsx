import React from 'react';
import { AspectIcon } from '../../../../collaboration/aspect/icon/AspectIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface PostTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const PostTemplateCard = (props: PostTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={AspectIcon} />;
};

export default PostTemplateCard;
