import { List, ListProps } from '@mui/material';
import React, { FC } from 'react';
import CardTemplateListItem, { CardTemplatesListItemType } from './CardTemplatesListItem';

interface CardTemplatesListProps extends ListProps {
  entities: {
    cardTemplates: CardTemplatesListItemType[];
    selectedCardTemplateType?: string;
  };
  actions: {
    onSelect: (cardTemplateType: string) => void;
  };
}

export const CardTemplatesList: FC<CardTemplatesListProps> = ({ entities, actions }) => {
  const { cardTemplates, selectedCardTemplateType } = entities;

  return (
    <List>
      {cardTemplates.map(template => (
        <CardTemplateListItem
          key={template.type}
          onClick={() => actions.onSelect(template.type)}
          cardTemplate={template}
          isSelected={template.type === selectedCardTemplateType}
        />
      ))}
    </List>
  );
};

export default CardTemplatesList;
