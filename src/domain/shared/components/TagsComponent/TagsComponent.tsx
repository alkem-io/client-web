import React, { FC, useCallback } from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { Box, BoxProps, Tooltip } from '@mui/material';
import { times } from 'lodash';
import { Theme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import LinesFitter from '../LinesFitter/LinesFitter';
import { CardText } from '../../../../core/ui/typography';

interface Props {
  tags: string[];
  count?: number;
  loading?: boolean;
  color?: ChipProps['color'];
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
}

const DEFAULT_TAGS_CONTAINER_PROPS: Partial<BoxProps> = {
  display: 'flex',
  gap: (theme: Theme) => theme.spacing(0.4),
  flexWrap: 'wrap',
  minHeight: (theme: Theme) => theme.spacing(4),
};

const TagsComponent: FC<Props & BoxProps> = ({
  tags,
  count = 3,
  loading,
  color,
  size = 'small',
  variant = 'outlined',
  ...tagsContainerProps
}) => {
  const { t } = useTranslation();

  const getMoreTagsTooltipTitle = (moreTags: string[]) => moreTags.join(', ');

  const renderTag = useCallback(
    (item: string, i: number) => (
      <Tooltip key={i} title={item} arrow placement="bottom">
        <Chip label={item} color={color} size={size} variant={variant} sx={{ maxWidth: '100%' }} />
      </Tooltip>
    ),
    [color, size, variant]
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
            <Chip variant="outlined" color="primary" sx={{ borderColor: 'primary.main' }} size="small" />
          </Skeleton>
        ))}
      </Box>
    );
  }

  if (tags.length === 0) {
    return (
      <Box {...tagsContainerProps}>
        <CardText color="neutral.main">{t('components.tags-component.no-tags')}</CardText>
      </Box>
    );
  }

  console.log(
    {
      ...DEFAULT_TAGS_CONTAINER_PROPS,
      ...tagsContainerProps,
    }.minHeight
  );

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
