import {
  AllInclusive as AllInclusiveIcon,
  Category as CategoryIcon,
  Celebration as CelebrationIcon,
  GpsNotFixedOutlined as GpsNotFixedOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
  QuestionAnswerOutlined as QuestionAnswerOutlinedIcon,
  QuestionMark as QuestionMarkIcon,
} from '@mui/icons-material';

import type { SvgIconProps } from '@mui/material';
import { createElement, type FC, useMemo } from 'react';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import { type DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../constants/DiscusionCategories';

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
