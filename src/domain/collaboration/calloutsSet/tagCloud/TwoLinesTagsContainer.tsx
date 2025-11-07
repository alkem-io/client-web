import { gutters } from '@/core/ui/grid/utils';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Chip, Link, Tooltip } from '@mui/material';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';

const TwoLinesTagsContainer = ({ tags, onClickTag }: { tags: string[]; onClickTag: (tag: string) => void }) => {
  const { t } = useTranslation();
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

  const displayedTags = expanded ? tags : tags.slice(0, collapsedCount);
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
        {tags.map((tag, index) => (
          <Chip key={`${tag}-${index}`} label={tag} size="small" variant="outlined" />
        ))}
      </Box>

      <Box display="flex" flexWrap="wrap" gap={gutters(0.5)}>
        {displayedTags.map((tag, index) => (
          <Tooltip key={`$${tag}-${index}`} title={t('components.tagCloud.filterByTag', { tag })}>
            <Chip
              label={tag}
              variant="outlined"
              size="small"
              onClick={() => onClickTag(tag)}
              sx={{ cursor: 'pointer' }}
            />
          </Tooltip>
        ))}
        {!expanded && hiddenCount > 0 && (
          <Tooltip title={t('components.tagCloud.showMoreTags', { count: hiddenCount })}>
            <Chip
              label={`+${hiddenCount}`}
              variant="filled"
              size="small"
              onClick={() => setExpanded(true)}
              sx={{ cursor: 'pointer' }}
              aria-label={t('components.tagCloud.showMoreTags', { count: hiddenCount })}
            />
          </Tooltip>
        )}
        {expanded && (
          <Tooltip title={t('components.tagCloud.showFewerTags')}>
            <Link
              onClick={() => setExpanded(false)}
              sx={{ cursor: 'pointer' }}
              aria-label={t('components.tagCloud.showFewerTags')}
            >
              <KeyboardArrowUpIcon fontSize="small" />
            </Link>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default TwoLinesTagsContainer;
