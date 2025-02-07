import React, { useCallback, useState } from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import { Box, BoxProps, ClickAwayListener, Tooltip, useTheme } from '@mui/material';
import { times } from 'lodash';
import { Theme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import LinesFitter from '../LinesFitter/LinesFitter';
import { CardText } from '@/core/ui/typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface TagsComponentProps extends BoxProps {
  tags: string[];
  count?: number;
  loading?: boolean;
  height?: number | string | ((theme: Theme) => number | string);
  color?: ChipProps['color'];
  size?: ChipProps['size'];
  variant?: ChipProps['variant'];
  selectedVariant?: ChipProps['variant'];
  selectedIndexes?: number[];
  canShowAll?: boolean;
  onClickTag?: (tag: string, index: number) => void;
}

const getDefaultTagsContainerProps = (hasHeight?: boolean): Partial<BoxProps> => ({
  display: 'flex',
  gap: theme => theme.spacing(0.4),
  rowGap: theme => theme.spacing(1),
  flexWrap: 'wrap',
  // TODO this is left for compatibility with older components that don't specify height on TagsComponent
  minHeight: hasHeight ? undefined : (theme: Theme) => theme.spacing(4),
});

const TagsComponent = ({
  tags,
  count = 3,
  loading,
  color,
  size = 'small',
  variant = 'outlined',
  selectedVariant = 'filled',
  height,
  canShowAll = false,
  selectedIndexes = [],
  onClickTag,
  ...tagsContainerProps
}: TagsComponentProps) => {
  const { t } = useTranslation();
  const [isExpanded, setExpanded] = useState(false);

  const theme = useTheme();

  const getMoreTagsTooltipTitle = (moreTags: string[]) => moreTags.join(', ');

  const renderTag = useCallback(
    (item: string, i: number) => (
      <Tooltip key={i} title={item} arrow placement="bottom">
        <Chip
          label={item}
          color={color}
          size={size}
          variant={selectedIndexes.includes(i) ? selectedVariant : variant}
          sx={{ maxWidth: '100%' }}
          onClick={onClickTag ? () => onClickTag(item, i) : undefined}
        />
      </Tooltip>
    ),
    [color, size, variant, selectedIndexes, selectedVariant]
  );

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const renderMore = (remainingTags: string[]) => (
    <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
      <Tooltip
        title={getMoreTagsTooltipTitle(remainingTags)}
        arrow
        placement="bottom"
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
      >
        <Chip
          label={`+${remainingTags.length}`}
          size={size}
          onClick={event => {
            event.preventDefault();
            canShowAll ? setExpanded(true) : setTooltipOpen(true);
          }}
        />
      </Tooltip>
    </ClickAwayListener>
  );

  const renderShowLess = () => (
    <ExpandLessIcon sx={{ cursor: 'pointer' }} fontSize="small" onClick={() => setExpanded(false)} />
  );

  if (loading) {
    return (
      <Box {...tagsContainerProps}>
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

  if (canShowAll && isExpanded) {
    return (
      <Box {...getDefaultTagsContainerProps(false)} {...tagsContainerProps}>
        {tags.map((tag, index) => renderTag(tag, index))}
        {renderShowLess()}
      </Box>
    );
  }

  const computedHeight = typeof height === 'function' ? height(theme) : height;

  return (
    <LinesFitter
      items={tags}
      renderItem={renderTag}
      renderMore={renderMore}
      {...getDefaultTagsContainerProps(typeof height !== 'undefined')}
      {...tagsContainerProps}
      height={computedHeight}
    />
  );
};

export default TagsComponent;
