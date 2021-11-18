import { SvgIconProps } from '@material-ui/core';
import { AllInclusive } from '@material-ui/icons';
import EmojiObjectsOutlinedIcon from '@material-ui/icons/EmojiObjectsOutlined';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';
import QuestionAnswerOutlinedIcon from '@material-ui/icons/QuestionAnswerOutlined';
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
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
        // TODO To be updated to LightBulb after migration to v5
        return EmojiObjectsOutlinedIcon;
      case DiscussionCategory.Questions:
        return HelpOutlinedIcon;
      case DiscussionCategory.Sharing:
        return ShareOutlinedIcon;
      case DiscussionCategoryExtEnum.All:
        return AllInclusive;
      default:
        return QuestionAnswerOutlinedIcon;
    }
  }, [category]);

  return createElement(categoryIcon, { ...rest });
};
export default DiscussionIcon;
