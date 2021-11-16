import { ComponentType } from 'react';
import QuestionAnswerOutlinedIcon from '@material-ui/icons/QuestionAnswerOutlined';
import EmojiObjectsOutlinedIcon from '@material-ui/icons/EmojiObjectsOutlined';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
import { DiscussionCategory } from '../../models/graphql-schema';

export const getDiscussionCategoryIcon = (category: DiscussionCategory): ComponentType<any> => {
  const dict = {
    [DiscussionCategory.General]: QuestionAnswerOutlinedIcon,
    [DiscussionCategory.Ideas]: EmojiObjectsOutlinedIcon,
    [DiscussionCategory.Questions]: HelpOutlinedIcon,
    [DiscussionCategory.Sharing]: ShareOutlinedIcon,
  } as const;

  return dict[category];
};
