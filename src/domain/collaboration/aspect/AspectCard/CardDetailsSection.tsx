import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Text } from '../../../../core/ui/typography';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';

export const CardDescription = ({ description = '' }: { description?: string }) => {
  return (
    <Box minHeight={gutters(6)} paddingX={1.5} paddingY={1}>
      <Text>{description}</Text>
    </Box>
  );
};

export interface CardTagsProps {
  tags: string[] | undefined;
}

export const CardTags = ({ tags = [] }: CardTagsProps) => {
  return <TagsComponent tags={tags} display="flex" paddingX={1.5} paddingY={1} />;
};

const CardDetailsSection = ({ children }: PropsWithChildren<{}>) => {
  // TODO use GridItem when placed within a <PageContentBlock cards> instead of manually setting width
  return (
    <Box width={230} sx={{ backgroundColor: 'background.default' }}>
      {children}
    </Box>
  );
};

export default CardDetailsSection;
