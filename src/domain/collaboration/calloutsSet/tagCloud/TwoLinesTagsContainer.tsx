import { gutters } from '@/core/ui/grid/utils';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Chip, ChipProps, Link, Tooltip } from '@mui/material';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';

const Tag = ({ tag, onClick }: { tag: string; onClick: ChipProps['onClick'] }) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('components.tagCloud.filterByTag', { tag })} arrow>
      <Chip
        label={tag}
        variant="outlined"
        size="small"
        onClick={onClick}
        sx={{ cursor: 'pointer' }}
        aria-label={t('components.tagCloud.filterByTag', { tag })}
      />
    </Tooltip>
  );
};

const ShowMoreChip = ({ count, onClick }: { count: number; onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('components.tagCloud.showMoreTags', { count })} arrow>
      <Chip
        label={`+${count}`}
        variant="filled"
        size="small"
        onClick={onClick}
        sx={{ cursor: 'pointer' }}
        aria-label={t('components.tagCloud.showMoreTags', { count })}
      />
    </Tooltip>
  );
};

const ShowLessChip = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('components.tagCloud.showFewerTags')} arrow>
      <Link onClick={onClick} sx={{ cursor: 'pointer' }} aria-label={t('components.tagCloud.showFewerTags')}>
        <KeyboardArrowUpIcon fontSize="small" />
      </Link>
    </Tooltip>
  );
};

const TwoLinesTagsContainer = ({ tags, onClickTag }: { tags: string[]; onClickTag: (tag: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [collapsedCount, setCollapsedCount] = useState(tags.length);
  const measurementRef = useRef<HTMLDivElement | null>(null);
  const { ref: resizeRef, width } = useResizeDetector();

  const tagsKey = useMemo(() => tags.join('|'), [tags]);

  useEffect(() => {
    setCollapsedCount(tags.length);
  }, [tags.length]);

  // Measure hidden chip layout to determine how many fit within two rows.
  useLayoutEffect(() => {
    if (expanded) {
      return;
    }

    if (!measurementRef.current) {
      return;
    }

    const observedWidth = width ?? measurementRef.current.getBoundingClientRect().width;
    if (observedWidth === 0) {
      return;
    }

    const chips = Array.from(measurementRef.current.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement
    );

    if (chips.length === 0) {
      if (collapsedCount !== 0) {
        setCollapsedCount(0);
      }
      return;
    }

    const rowOffsets: number[] = [];
    chips.forEach(chip => {
      const top = chip.offsetTop;
      if (!rowOffsets.includes(top)) {
        rowOffsets.push(top);
      }
    });
    rowOffsets.sort((a, b) => a - b);

    if (rowOffsets.length <= 2) {
      const desiredCount = tags.length;
      if (collapsedCount !== desiredCount) {
        setCollapsedCount(desiredCount);
      }
      return;
    }

    const maxAllowedTop = rowOffsets[1];
    let allowedCount = chips.length;
    for (let index = 0; index < chips.length; index += 1) {
      if (chips[index].offsetTop > maxAllowedTop) {
        allowedCount = index;
        break;
      }
    }

    const nextCount = Math.max(Math.min(allowedCount - 1, tags.length), 0);
    if (collapsedCount !== nextCount) {
      setCollapsedCount(nextCount);
    }
  }, [tagsKey, width, expanded, collapsedCount, tags.length]);

  const visibleTags = expanded ? tags : tags.slice(0, collapsedCount);
  const displayedTags = {
    // Last tag is always grouped with the Show More / Show Less button, for better alignment.
    allButLast: visibleTags.slice(0, visibleTags.length - 1),
    last: visibleTags[visibleTags.length - 1],
  };
  const hiddenCount = expanded ? 0 : Math.max(tags.length - collapsedCount, 0);

  return (
    <Box ref={resizeRef} sx={{ position: 'relative' }}>
      <Box
        ref={measurementRef}
        aria-hidden
        sx={{
          position: 'absolute',
          pointerEvents: 'none',
          visibility: 'hidden',
          zIndex: -1,
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          gap: gutters(0.5),
        }}
      >
        {tags.map(tag => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Box>

      <Box display="flex" flexWrap="wrap" gap={gutters(0.5)}>
        {/* Render all displayed tags except the last one */}
        {displayedTags.allButLast.map(tag => (
          <Tag key={tag} tag={tag} onClick={() => onClickTag(tag)} />
        ))}
        {/* Render the last tag together with Show More / Show Less button because in some cases the button collapses down and looks weird */}
        <Box display="flex" gap={gutters(0.5)}>
          <Tag key={displayedTags.last} tag={displayedTags.last} onClick={() => onClickTag(displayedTags.last)} />
          {!expanded && hiddenCount > 0 && <ShowMoreChip count={hiddenCount} onClick={() => setExpanded(true)} />}
          {expanded && <ShowLessChip onClick={() => setExpanded(false)} />}
        </Box>
      </Box>
    </Box>
  );
};

export default TwoLinesTagsContainer;
