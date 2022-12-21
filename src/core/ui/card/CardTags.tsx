import React from 'react';
import { gutters } from '../grid/utils';
import TagsComponent, { TagsComponentProps } from '../../../domain/shared/components/TagsComponent/TagsComponent';

interface CardTagsProps extends TagsComponentProps {
  rows?: number;
}

const CardTags = ({ rows = 1, ...props }: CardTagsProps) => {
  const heightGutters = rows + (rows - 1) * 0.5;

  return <TagsComponent variant="filled" height={gutters(heightGutters)} marginTop={0.5} color="primary" {...props} />;
};

export default CardTags;
