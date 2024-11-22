import CardDescription, { CardDescriptionProps, DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from './CardDescription';
import CardTags, { CardTagsProps } from './CardTags';

interface CardDescriptionWithTagsProps extends CardDescriptionProps {
  tags?: string[];
  tagsContainerProps?: Omit<CardTagsProps, 'tags'>;
}

export const CardDescriptionWithTags = ({
  tags = [],
  tagsContainerProps,
  heightGutters,
  ...props
}: CardDescriptionWithTagsProps) => {
  const descriptionHeight =
    heightGutters ??
    (tags.length > 0 ? DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS : DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS + 2);

  return (
    <>
      <CardDescription heightGutters={descriptionHeight} {...props} />
      <CardTags tags={tags} marginY={1} hideIfEmpty {...tagsContainerProps} />
    </>
  );
};

export default CardDescriptionWithTags;
