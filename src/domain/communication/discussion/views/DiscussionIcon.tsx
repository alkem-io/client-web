import {
  AllInclusive as AllInclusiveIcon,
  Category as CategoryIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  GpsNotFixedOutlined as GpsNotFixedOutlinedIcon,
  QuestionMark as QuestionMarkIcon,
  MoreHoriz as MoreHorizIcon,
  HelpOutlined as HelpOutlinedIcon,
  LightbulbOutlined as LightbulbOutlinedIcon,
  QuestionAnswerOutlined as QuestionAnswerOutlinedIcon,
  ShareOutlined as ShareOutlinedIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';

import { SvgIconProps } from '@mui/material';
import { createElement, FC, useMemo } from 'react';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../constants/DiscusionCategories';
import { DiscussionCategory } from '../../../../core/apollo/generated/graphql-schema';

export interface DiscussionIconProps extends SvgIconProps {
  category: DiscussionCategoryExt;
}

export const DiscussionIcon: FC<DiscussionIconProps> = ({ category, ...rest }) => {
  const categoryIcon = useMemo(() => {
    switch (category) {
      case DiscussionCategory.Releases:
        return CelebrationIcon;
      case DiscussionCategory.PlatformFunctionalities:
        return CategoryIcon;
      case DiscussionCategory.ChallengeCentric:
        return GpsNotFixedOutlinedIcon;
      case DiscussionCategory.CommunityBuilding:
        return GroupsOutlinedIcon;
      case DiscussionCategory.Help:
        return QuestionMarkIcon;
      case DiscussionCategory.Other:
        return MoreHorizIcon;
      case DiscussionCategory.General:
        return QuestionAnswerOutlinedIcon;
      case DiscussionCategory.Ideas:
        return LightbulbOutlinedIcon;
      case DiscussionCategory.Questions:
        return HelpOutlinedIcon;
      case DiscussionCategory.Sharing:
        return ShareOutlinedIcon;
      case DiscussionCategoryExtEnum.All:
        return AllInclusiveIcon;
      default:
        return QuestionAnswerOutlinedIcon;
    }
  }, [category]);

  return createElement(categoryIcon, { ...rest });
};

export default DiscussionIcon;
