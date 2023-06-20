import React from 'react';
import { PostIcon } from '../../../../collaboration/post/icon/PostIcon';
import SimpleCard, { SimpleCardProps } from '../../../../shared/components/SimpleCard';

interface PostTemplateCardProps extends Omit<SimpleCardProps, 'iconComponent'> {}

const PostTemplateCard = (props: PostTemplateCardProps) => {
  return <SimpleCard {...props} iconComponent={PostIcon} />;
};

export default PostTemplateCard;
