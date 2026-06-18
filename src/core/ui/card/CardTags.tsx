import { cn } from '@/crd/lib/utils';
import TagsComponent, { type TagsComponentProps } from '@/domain/shared/components/TagsComponent/TagsComponent';

// gutters(n) historically resolved to theme.spacing(GUTTER_MUI * n) = 16 * n px.
const GUTTER_PX = 16;

export type CardTagsProps = TagsComponentProps & {
  rows?: number;
  disableIndentation?: boolean;
  hideIfEmpty?: boolean; // If no tags are passed and this flag is falsey the element will show "No tags available"
};

const CardTags = ({
  rows = 1,
  disableIndentation,
  hideIfEmpty = false,
  tags,
  className,
  style,
  ...props
}: CardTagsProps) => {
  const heightGutters = rows + (rows - 1) * 0.5;

  if (hideIfEmpty && tags.length === 0) {
    return null;
  }

  return (
    <TagsComponent
      variant="filled"
      color="primary"
      height={heightGutters * GUTTER_PX}
      className={cn('mt-1', disableIndentation ? undefined : 'pl-3', className)}
      style={style}
      tags={tags}
      {...props}
    />
  );
};

export default CardTags;
