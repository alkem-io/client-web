import React, { ReactElement, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { formatTimeElapsed } from '../../utils/formatTimeElapsed';
import journeyIcon from '../JourneyIcon/JourneyIcon';
import RouterLink from '../../../../core/ui/link/RouterLink';

export interface ActivityDescriptionProps {
  i18nKey: TranslationKey;
  values?: Record<string, string | undefined>;
  components?: Record<string, ReactElement>;
  createdDate: Date | string;
  journeyDisplayName?: string; // Callout name or Journey name
  journeyUrl?: string;
  journeyTypeName: JourneyTypeName | undefined;
  author?: {
    displayName?: string;
    url?: string;
  };
  withLinkToParent?: boolean;
}

const PARENT_NAME_MAX_LENGTH = 20;

const ActivityDescription = ({
  i18nKey,
  createdDate,
  journeyDisplayName,
  journeyUrl,
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
        mergedComponents['userlink'] = <RouterLink to={author.url} loose />;
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

    mergedComponents['parentlink'] = journeyUrl ? <RouterLink to={journeyUrl} loose /> : <span />;

    return {
      values: mergedValues,
      components: mergedComponents,
    };
  }, [
    createdDate,
    t,
    author,
    author?.displayName,
    author?.url,
    journeyDisplayName,
    journeyTypeName,
    journeyUrl,
    i18nKey,
  ]);

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
