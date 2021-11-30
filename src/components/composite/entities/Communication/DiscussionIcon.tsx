import {
  AllInclusive,
  HelpOutlined,
  LightbulbOutlined,
  QuestionAnswerOutlined,
  ShareOutlined,
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';
import { createElement, FC, useMemo } from 'react';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../../../../models/enums/DiscussionCategoriesExt';
import { DiscussionCategory } from '../../../../models/graphql-schema';

export interface DiscussionIconProps extends SvgIconProps {
  category: DiscussionCategoryExt;
}

export const DiscussionIcon: FC<DiscussionIconProps> = ({ category, ...rest }) => {
  const categoryIcon = useMemo(() => {
    switch (category) {
      case DiscussionCategory.Ideas:
        return LightbulbOutlined;
      case DiscussionCategory.Questions:
        return HelpOutlined;
      case DiscussionCategory.Sharing:
        return ShareOutlined;
      case DiscussionCategoryExtEnum.All:
        return AllInclusive;
      default:
        return QuestionAnswerOutlined;
    }
  }, [category]);

  return createElement(categoryIcon, { ...rest });
};
export default DiscussionIcon;
