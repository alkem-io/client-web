import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Text } from '../../../../core/ui/typography';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';

export const CardDescription = ({ description = '' }: { description?: string }) => {
  return (
    <Box height={gutters(6)} paddingX={1.5} paddingY={1}>
      <Text maxHeight="100%" overflow="hidden" sx={webkitLineClamp}>
        {description}
      </Text>
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
  return <Box sx={{ backgroundColor: 'background.default' }}>{children}</Box>;
};

export default CardDetailsSection;
