import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

import hexToRGBA from '../../../../common/utils/hexToRGBA';
import { Caption } from '../../../../core/ui/typography';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';

export const CardDescription = ({ description = '' }: { description?: string }) => {
  return (
    <Box
      sx={{
        width: theme => theme.spacing(30),
        height: theme => theme.spacing(16),
        padding: theme => theme.spacing(2),
      }}
    >
      <Caption>{description}</Caption>
    </Box>
  );
};

export interface CardTagsProps {
  tags: string[] | undefined;
}

export const CardTags = ({ tags = [] }: CardTagsProps) => {
  return (
    <Box
      sx={{
        width: theme => theme.spacing(30),
        height: theme => theme.spacing(4.5),
        paddingX: theme => theme.spacing(2),
      }}
    >
      <TagsComponent tags={tags} />
    </Box>
  );
};

export interface CardDetailsSectionProps {
  description?: string;
  tags: string[];
}

const CardDetailsSection = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Box
      sx={{
        background: theme => hexToRGBA(theme.palette.highlight.main, 0.5),
      }}
    >
      {children}
    </Box>
  );
};

export default CardDetailsSection;
