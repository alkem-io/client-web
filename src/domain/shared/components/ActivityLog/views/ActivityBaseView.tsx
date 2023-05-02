import React, { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import { formatTimeElapsed } from '../../../utils/formatTimeElapsed';
import AuthorAvatar from '../../AuthorAvatar/AuthorAvatar';
import { Author } from '../../AuthorAvatar/models/author';
import { Caption } from '../../../../../core/ui/typography';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';

const PARENT_NAME_MAX_LENGTH = 20;

export interface ActivityBaseViewProps {
  author: Author | undefined;
  createdDate: Date | string;
  action: string;
  url?: string;
  loading?: boolean;
  activityOriginJourneyIcon?: ReactNode;
  parentDisplayName: string;
}

export const ActivityBaseView: FC<ActivityBaseViewProps> = ({
  author,
  createdDate,
  action,
  children,
  url,
  loading,
  activityOriginJourneyIcon,
  parentDisplayName,
}) => {
  const { t } = useTranslation();
  const formattedTime = useMemo(() => formatTimeElapsed(createdDate), [createdDate]);

  const truncatedParentName =
    parentDisplayName.length > PARENT_NAME_MAX_LENGTH
      ? parentDisplayName.substring(0, PARENT_NAME_MAX_LENGTH).concat('...')
      : parentDisplayName;

  const parentDetails = activityOriginJourneyIcon
    ? t('components.activity-log-view.parent-details', { displayName: truncatedParentName })
    : undefined;

  const title = useMemo(
    () => (
      <>
        {formattedTime}{' '}
        {author?.url ? (
          <a href={author.url}>'{author?.displayName ?? t('common.user')}'</a>
        ) : (
          author?.displayName ?? t('common.user')
        )}{' '}
        {action} {activityOriginJourneyIcon}
        {parentDetails}
      </>
    ),
    [formattedTime, author?.displayName, action, author?.url, t, activityOriginJourneyIcon, parentDetails]
  );

  return (
    <BadgeCardView
      visual={
        loading ? (
          <Skeleton>
            <AuthorAvatar author={undefined} />
          </Skeleton>
        ) : (
          <AuthorAvatar author={author} />
        )
      }
    >
      <Caption>{loading ? <Skeleton width="60%" /> : title}</Caption>
      {loading ? <Skeleton /> : url ? <Link to={url}>{children}</Link> : children}
    </BadgeCardView>
  );
};
