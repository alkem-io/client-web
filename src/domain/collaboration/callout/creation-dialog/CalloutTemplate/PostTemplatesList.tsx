import { List, ListProps } from '@mui/material';
import React, { FC } from 'react';
import PostTemplateListItem, { PostTemplatesListItemType } from './PostTemplatesListItem';

interface PostTemplatesListProps extends ListProps {
  entities: {
    postTemplates: PostTemplatesListItemType[];
    selectedPostTemplateType?: string;
  };
  actions: {
    onSelect: (postTemplateType: string) => void;
  };
}

export const PostTemplatesList: FC<PostTemplatesListProps> = ({ entities, actions }) => {
  const { postTemplates, selectedPostTemplateType } = entities;

  return (
    <List>
      {postTemplates.map(template => (
        <PostTemplateListItem
          key={template.type}
          onClick={() => actions.onSelect(template.type)}
          postTemplate={template}
          isSelected={template.type === selectedPostTemplateType}
        />
      ))}
    </List>
  );
};

export default PostTemplatesList;
