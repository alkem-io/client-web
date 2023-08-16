import React, { ReactElement, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import { buildJourneyUrl, JourneyLocation } from '../../../../main/routing/urlBuilders';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { formatTimeElapsed } from '../../utils/formatTimeElapsed';
import { Link } from '@mui/material';
import journeyIcon from '../JourneyIcon/JourneyIcon';

export interface ActivityDescriptionProps {
  i18nKey: TranslationKey;
  values?: Record<string, string | undefined>;
  components?: Record<string, ReactElement>;

  createdDate: Date | string;
  journeyDisplayName?: string; // Callout name or Journey name
  journeyLocation?: JourneyLocation;
  journeyTypeName: JourneyTypeName | undefined;
  author?: {
    displayName: string;
    url?: string;
  };
  withLinkToParent?: boolean;
}

const PARENT_NAME_MAX_LENGTH = 20;

const ActivityDescription = ({
  i18nKey,
  createdDate,
  journeyDisplayName,
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

    mergedValues['journey'] = journeyDisplayName;

    const truncatedParentName =
      journeyDisplayName && journeyDisplayName.length > PARENT_NAME_MAX_LENGTH
        ? journeyDisplayName.substring(0, PARENT_NAME_MAX_LENGTH).concat('…')
        : journeyDisplayName;
    if (truncatedParentName) {
      mergedValues['journeyDisplayName'] = truncatedParentName;
    }

    const JourneyIcon = journeyTypeName ? journeyIcon[journeyTypeName] : undefined;
    if (JourneyIcon) {
      mergedComponents['parenticon'] = <JourneyIcon fontSize="small" sx={{ verticalAlign: 'bottom' }} />;
      mergedComponents['journeyicon'] = <JourneyIcon fontSize="inherit" />;
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
  }, [createdDate, t, author, author?.displayName, author?.url, journeyDisplayName, journeyTypeName, i18nKey]);

  return (
    <>
      <Trans
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18nKey={i18nKey as any}
        {...props}
        shouldUnescape
      />
      {withLinkToParent && <Trans i18nKey="components.activity-log-view.parent-link" {...props} shouldUnescape />}
    </>
  );
};

export default ActivityDescription;
