import {
  AllInclusive as AllInclusiveIcon,
  Category as CategoryIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  GpsNotFixedOutlined as GpsNotFixedOutlinedIcon,
  QuestionMark as QuestionMarkIcon,
  MoreHoriz as MoreHorizIcon,
  QuestionAnswerOutlined as QuestionAnswerOutlinedIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';

import { SvgIconProps } from '@mui/material';
import { createElement, FC, useMemo } from 'react';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../constants/DiscusionCategories';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';

export interface DiscussionIconProps extends SvgIconProps {
  category: DiscussionCategoryExt;
}

export const DiscussionIcon: FC<DiscussionIconProps> = ({ category, ...rest }) => {
  const categoryIcon = useMemo(() => {
    switch (category) {
      case ForumDiscussionCategory.Releases:
        return CelebrationIcon;
      case ForumDiscussionCategory.PlatformFunctionalities:
        return CategoryIcon;
      case ForumDiscussionCategory.ChallengeCentric:
        return GpsNotFixedOutlinedIcon;
      case ForumDiscussionCategory.CommunityBuilding:
        return GroupsOutlinedIcon;
      case ForumDiscussionCategory.Help:
        return QuestionMarkIcon;
      case ForumDiscussionCategory.Other:
        return MoreHorizIcon;
      case DiscussionCategoryExtEnum.All:
        return AllInclusiveIcon;
      default:
        return QuestionAnswerOutlinedIcon;
    }
  }, [category]);

  return createElement(categoryIcon, { ...rest });
};

export default DiscussionIcon;
