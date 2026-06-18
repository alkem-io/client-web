import { times } from 'lodash-es';
import { ChevronUp } from 'lucide-react';
import { type CSSProperties, type HTMLAttributes, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';
import LinesFitter from '../LinesFitter/LinesFitter';

export type TagsComponentColor = 'primary' | 'default';
export type TagsComponentVariant = 'filled' | 'outlined';

export type TagsComponentProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  tags: string[];
  count?: number;
  loading?: boolean;
  /** Fixed container height (px). Enables the overflow "+N" line fitter. */
  height?: number;
  color?: TagsComponentColor;
  variant?: TagsComponentVariant;
  selectedVariant?: TagsComponentVariant;
  selectedIndexes?: number[];
  canShowAll?: boolean;
  hideNoTagsMessage?: boolean;
  onClickTag?: (tag: string, index: number) => void;
};

// Mirrors MUI <Chip size="small">: ~24px tall, fully rounded, 13px label, ellipsised.
const tagPillBase =
  'inline-flex h-6 max-w-full items-center rounded-full px-3 text-[0.8125rem] leading-none ' +
  'whitespace-nowrap overflow-hidden text-ellipsis transition-colors';

const tagPillClasses = (color: TagsComponentColor | undefined, variant: TagsComponentVariant, clickable: boolean) => {
  const filled = color === 'primary' ? 'bg-[#065ba3] text-white' : 'bg-[rgba(0,0,0,0.08)] text-[#181828]';
  const outlined =
    color === 'primary' ? 'border border-[#065ba3] text-[#065ba3]' : 'border border-[rgba(0,0,0,0.23)] text-[#181828]';
  return cn(tagPillBase, variant === 'filled' ? filled : outlined, clickable && 'cursor-pointer hover:opacity-90');
};

const TagsComponent = ({
  tags,
  count = 3,
  loading,
  color,
  variant = 'outlined',
  selectedVariant = 'filled',
  height,
  canShowAll = false,
  selectedIndexes = [],
  hideNoTagsMessage = false,
  onClickTag,
  className,
  style,
  ...tagsContainerProps
}: TagsComponentProps) => {
  const { t } = useTranslation();
  const [isExpanded, setExpanded] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const getMoreTagsTooltipTitle = (moreTags: string[]) => moreTags.join(', ');

  const containerClassName = cn('flex flex-wrap gap-x-[3px] gap-y-2', !height && 'min-h-8', className);

  const renderTag = (item: string, i: number) => {
    const itemVariant = selectedIndexes.includes(i) ? selectedVariant : variant;
    return (
      <Tooltip key={i}>
        <TooltipTrigger asChild={true}>
          {onClickTag ? (
            <button
              type="button"
              className={tagPillClasses(color, itemVariant, true)}
              onClick={() => onClickTag(item, i)}
            >
              {item}
            </button>
          ) : (
            <span className={tagPillClasses(color, itemVariant, false)}>{item}</span>
          )}
        </TooltipTrigger>
        <TooltipContent>{item}</TooltipContent>
      </Tooltip>
    );
  };

  const renderMore = (remainingTags: string[]) => (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild={true}>
        <button
          type="button"
          className={tagPillClasses(undefined, 'filled', true)}
          onClick={event => {
            event.preventDefault();
            if (canShowAll) {
              setExpanded(true);
            } else {
              setTooltipOpen(open => !open);
            }
          }}
        >
          {`+${remainingTags.length}`}
        </button>
      </TooltipTrigger>
      <TooltipContent>{getMoreTagsTooltipTitle(remainingTags)}</TooltipContent>
    </Tooltip>
  );

  const renderShowLess = () => (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center"
      aria-label={t('buttons.collapse')}
      onClick={() => setExpanded(false)}
    >
      <ChevronUp className="size-5" aria-hidden={true} />
    </button>
  );

  if (loading) {
    return (
      <div className={containerClassName} style={style} {...tagsContainerProps}>
        {times(count, i => (
          <Skeleton key={i} className="h-6 rounded-full" style={{ width: `${100 / count}%` }} />
        ))}
      </div>
    );
  }

  if (tags.length === 0 && !hideNoTagsMessage) {
    return (
      <div className={containerClassName} style={style} {...tagsContainerProps}>
        <span className="text-[0.875rem] text-[#747486]">{t('components.tags-component.no-tags')}</span>
      </div>
    );
  }

  if (canShowAll && isExpanded) {
    return (
      <div className={containerClassName} style={style} {...tagsContainerProps}>
        {tags.map((tag, index) => renderTag(tag, index))}
        {renderShowLess()}
      </div>
    );
  }

  const wrapperStyle: CSSProperties | undefined = height ? { ...style, maxHeight: undefined } : style;

  return (
    <LinesFitter
      items={tags}
      renderItem={renderTag}
      renderMore={renderMore}
      className={containerClassName}
      style={wrapperStyle}
      height={height}
      {...tagsContainerProps}
    />
  );
};

export default TagsComponent;
