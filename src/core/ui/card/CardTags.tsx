import React from 'react';
import TagsComponent from '../../../domain/shared/components/TagsComponent/TagsComponent';

export interface CardTagsProps {
  tags: string[] | undefined;
}

export const CardTags = ({ tags = [] }: CardTagsProps) => {
  return <TagsComponent tags={tags} display="flex" paddingX={1.5} paddingY={1} />;
};

export default CardTags;
