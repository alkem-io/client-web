import React, { FC, useCallback } from 'react';
import Chip from '@mui/material/Chip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import { Box, BoxProps, Tooltip, Typography } from '@mui/material';
import { times } from 'lodash';
import { Theme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import LinesFitter from '../LinesFitter/LinesFitter';

interface Props {
  tags: string[];
  count?: number;
  loading?: boolean;
}

const DEFAULT_TAGS_CONTAINER_PROPS: Partial<BoxProps> = {
  display: 'flex',
  gap: (theme: Theme) => theme.spacing(0.4),
  flexWrap: 'wrap',
  minHeight: (theme: Theme) => theme.spacing(4),
};

const TagsComponent: FC<Props & BoxProps> = ({ tags, count = 3, loading, minHeight, ...tagsContainerProps }) => {
  const { t } = useTranslation();

  const getMoreTagsTooltipTitle = (moreTags: string[]) => moreTags.join(', ');

  const renderTag = useCallback(
    (item: string, i: number) => (
      <Tooltip key={i} title={item} arrow placement="bottom">
        <Chip
          label={item}
          variant="outlined"
          color="primary"
          sx={{ borderColor: 'primary.main', maxWidth: '100%' }}
          size="small"
        />
      </Tooltip>
    ),
    []
  );

  const renderMore = useCallback(
    (remainingTags: string[]) => (
      <Tooltip title={getMoreTagsTooltipTitle(remainingTags)} arrow placement="bottom">
        <Chip label={`+${remainingTags.length}`} size="small" />
      </Tooltip>
    ),
    []
  );

  if (loading) {
    return (
      <Box {...DEFAULT_TAGS_CONTAINER_PROPS} {...tagsContainerProps}>
        {times(count, i => (
          <Skeleton key={i} width={`${100 / count}%`}>
            <Chip
              variant="outlined"
              color="primary"
              sx={{ borderColor: 'primary.main' }}
              size="small"
              icon={<FiberManualRecordIcon fontSize="small" />}
            />
          </Skeleton>
        ))}
      </Box>
    );
  }

  if (tags.length === 0) {
    return (
      <Typography color="neutral.main" variant="subtitle2">
        {t('components.tags-component.no-tags')}
      </Typography>
    );
  }

  return (
    <LinesFitter
      items={tags}
      renderItem={renderTag}
      renderMore={renderMore}
      {...DEFAULT_TAGS_CONTAINER_PROPS}
      {...tagsContainerProps}
    />
  );
};

export default TagsComponent;
