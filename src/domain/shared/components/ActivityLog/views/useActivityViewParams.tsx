import { ReactNode, useMemo } from 'react';
import { formatTimeElapsed } from '../../../utils/formatTimeElapsed';
import { useTranslation } from 'react-i18next';
import { JourneyTypeName } from '../../../../challenge/JourneyTypeName';
import journeyIcon from '../../JourneyIcon/JourneyIcon';
import { Author } from '../../AuthorAvatar/models/author';
import { Link } from '@mui/material';
import TranslationKey from '../../../../../types/TranslationKey';
import { JourneyLocation, buildJourneyUrl } from '../../../../../common/utils/urlBuilders';

const PARENT_NAME_MAX_LENGTH = 20;

interface Props {
  activityType:
    | 'callout-published'
    | 'challenge-created'
    | 'discussion-comment-created'
    | 'member-joined'
    | 'post-comment-created'
    | 'post-created'
    | 'whiteboard-created'
    | 'opportunity-created'
    | 'update-sent';
  createdDate: Date | string;
  parentDisplayName: string | undefined; // Callout name or Journey name
  journeyLocation: JourneyLocation | undefined;
  journeyTypeName: JourneyTypeName | undefined;
  author: Author | undefined;

  values?: Record<string, string | undefined>;
  components?: Record<string, ReactNode>;
}

interface UseActivityViewParamsProvided extends Pick<Props, 'values' | 'components'> {
  i18nKey: TranslationKey;
}

const useActivityViewParams = ({
  activityType,
  createdDate,
  parentDisplayName,
  journeyLocation,
  journeyTypeName,
  author,
  values = {},
  components = {},
}: Props) => {
  const { t } = useTranslation();

  const result = useMemo<UseActivityViewParamsProvided>(() => {
    const time = formatTimeElapsed(createdDate, t);
    values['time'] = time;

    if (author) {
      values['user'] = author.displayName;
      if (author.url) {
        components['UserLink'] = <Link href={author.url} />;
      } else {
        components['UserLink'] = <span />;
      }
    } else {
      values['user'] = t('common.user');
    }

    const truncatedParentName =
      parentDisplayName && parentDisplayName.length > PARENT_NAME_MAX_LENGTH
        ? parentDisplayName.substring(0, PARENT_NAME_MAX_LENGTH).concat('...')
        : parentDisplayName;
    if (truncatedParentName) {
      values['parentDisplayName'] = truncatedParentName;
    }

    const JourneyIcon = journeyTypeName ? journeyIcon[journeyTypeName] : undefined;
    if (JourneyIcon) {
      components['ParentIcon'] = <JourneyIcon fontSize="small" sx={{ verticalAlign: 'bottom' }} />;
    }

    if (journeyTypeName) {
      values['journeyType'] = t(`common.${journeyTypeName}` as const);
    }

    if (journeyLocation) {
      components['ParentLink'] = <Link href={buildJourneyUrl(journeyLocation)} />;
    }

    return {
      i18nKey: `components.activity-log-view.actions.${activityType}` as const,
      values,
      components,
    };
  }, [createdDate, t, author, author?.displayName, author?.url, parentDisplayName, journeyTypeName, activityType]);

  return result;
};

export default useActivityViewParams;
