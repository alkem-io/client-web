import { gutters } from '../grid/utils';
import TagsComponent, { TagsComponentProps } from '@/domain/shared/components/TagsComponent/TagsComponent';

export interface CardTagsProps extends TagsComponentProps {
  rows?: number;
  disableIndentation?: boolean;
  hideIfEmpty?: boolean; // If no tags are passed and this flag is falsey the element will show "No tags available"
}

const CardTags = ({ rows = 1, disableIndentation, hideIfEmpty = false, tags, ...props }: CardTagsProps) => {
  const heightGutters = rows + (rows - 1) * 0.5;

  if (hideIfEmpty && tags.length === 0) {
    return null;
  }

  return (
    <TagsComponent
      variant="filled"
      height={gutters(heightGutters)}
      marginTop={0.5}
      paddingLeft={disableIndentation ? 0 : 1.5}
      color="primary"
      tags={tags}
      {...props}
    />
  );
};

export default CardTags;
