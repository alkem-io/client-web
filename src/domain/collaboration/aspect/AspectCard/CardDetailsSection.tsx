import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Text } from '../../../../core/ui/typography';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '../../../../core/ui/grid/utils';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';

const DESCRIPTION_TEXT_MAX_LINES = 5;

export const CardDescription = ({ description = '' }: { description?: string }) => {
  return (
    <Box height={gutters(DESCRIPTION_TEXT_MAX_LINES + 1)} paddingX={1.5} paddingY={1}>
      <Text maxHeight="100%" overflow="hidden" sx={webkitLineClamp(DESCRIPTION_TEXT_MAX_LINES)}>
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
