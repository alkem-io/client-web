import { SvgIconProps } from '@material-ui/core';
import { AllInclusive, EmojiObjects, Forum, HelpOutline, Share } from '@material-ui/icons';
import { createElement, FC, useMemo } from 'react';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../../../../models/enums/DiscussionCategoriesExt';
import { DiscussionCategory } from '../../../../models/graphql-schema';

interface DiscussionIconProps extends SvgIconProps {
  category: DiscussionCategoryExt;
}

export const DiscussionIcon: FC<DiscussionIconProps> = ({ category, ...rest }) => {
  const categoryIcon = useMemo(() => {
    switch (category) {
      case DiscussionCategory.Ideas:
        // TODO To be updated to LigthBulb after migration to v5
        return EmojiObjects;
      case DiscussionCategory.Questions:
        return HelpOutline;
      case DiscussionCategory.Sharing:
        return Share;
      case DiscussionCategoryExtEnum.All:
        return AllInclusive;
      default:
        return Forum;
    }
  }, [category]);

  return createElement(categoryIcon, { ...rest });
};
export default DiscussionIcon;
