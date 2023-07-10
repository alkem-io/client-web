import React, { ReactElement, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import TranslationKey from '../../../../types/TranslationKey';
import { buildJourneyUrl, JourneyLocation } from '../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import { Author } from '../AuthorAvatar/models/author';
import { formatTimeElapsed } from '../../utils/formatTimeElapsed';
import { Link } from '@mui/material';
import journeyIcon from '../JourneyIcon/JourneyIcon';

export interface ActivityDescriptionProps {
  i18nKey: TranslationKey;
  values?: Record<string, string | undefined>;
  components?: Record<string, ReactElement>;

  createdDate: Date | string;
  parentDisplayName?: string; // Callout name or Journey name
  journeyLocation?: JourneyLocation;
  journeyTypeName: JourneyTypeName | undefined;
  author?: Author;
  withLinkToParent?: boolean;
}

const PARENT_NAME_MAX_LENGTH = 20;

const ActivityDescription = ({
  i18nKey,
  createdDate,
  parentDisplayName,
  journeyLocation,
  journeyTypeName,
  author,
  values = {},
  components = {},
  withLinkToParent,
}: ActivityDescriptionProps) => {
  const { t } = useTranslation();

  const props = useMemo(() => {
    const mergedValues = { ...values };
    const mergedComponents = { ...components };

    const time = formatTimeElapsed(createdDate, t);
    mergedValues['time'] = time;

    if (author) {
      mergedValues['user'] = author.displayName;
      if (author.url) {
        mergedComponents['userlink'] = <Link href={author.url} />;
      } else {
        mergedComponents['userlink'] = <span />;
      }
    } else {
      mergedValues['user'] = t('common.user');
    }

    const truncatedParentName =
      parentDisplayName && parentDisplayName.length > PARENT_NAME_MAX_LENGTH
        ? parentDisplayName.substring(0, PARENT_NAME_MAX_LENGTH).concat('…')
        : parentDisplayName;
    if (truncatedParentName) {
      mergedValues['parentDisplayName'] = truncatedParentName;
    }

    const JourneyIcon = journeyTypeName ? journeyIcon[journeyTypeName] : undefined;
    if (JourneyIcon) {
      mergedComponents['parenticon'] = <JourneyIcon fontSize="small" sx={{ verticalAlign: 'bottom' }} />;
    }

    if (journeyTypeName) {
      mergedValues['journeyType'] = t(`common.${journeyTypeName}` as const);
    }

    if (journeyLocation) {
      mergedComponents['parentlink'] = <Link href={buildJourneyUrl(journeyLocation)} />;
    } else {
      mergedComponents['parentlink'] = <span />;
    }
    return {
      values: mergedValues,
      components: mergedComponents,
    };
  }, [createdDate, t, author, author?.displayName, author?.url, parentDisplayName, journeyTypeName, i18nKey]);

  return (
    <>
      <Trans
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18nKey={i18nKey as any}
        {...props}
      />
      {withLinkToParent && <Trans i18nKey="components.activity-log-view.parent-link" {...props} />}
    </>
  );
};

export default ActivityDescription;
