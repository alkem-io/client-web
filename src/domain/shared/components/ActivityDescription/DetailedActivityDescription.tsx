import { ReactElement, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { spaceLevelIcon } from '../../../space/icons/SpaceIconByLevel';
import RouterLink from '@/core/ui/link/RouterLink';
import { RoleSetContributorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface ActivityDescriptionProps {
  i18nKey: TranslationKey;
  values?: Record<string, string | undefined>;
  components?: Record<string, ReactElement>;
  createdDate: Date | string;
  spaceDisplayName?: string; // Callout name or Space name
  spaceUrl?: string;
  spaceLevel?: SpaceLevel;
  author?: {
    displayName?: string;
    url?: string;
  };
  withLinkToParent?: boolean;
  type?: RoleSetContributorType;
}

const PARENT_NAME_MAX_LENGTH = 20;

const DetailedActivityDescription = ({
  i18nKey,
  createdDate,
  spaceDisplayName,
  spaceUrl,
  spaceLevel,
  author,
  values = {},
  components = {},
  withLinkToParent,
  type,
}: ActivityDescriptionProps) => {
  const { t } = useTranslation();

  const props = useMemo(() => {
    const mergedValues = { ...values };
    const mergedComponents = { ...components };

    mergedValues['time'] = formatTimeElapsed(createdDate, t);

    if (author) {
      mergedValues['user'] = author.displayName;
      if (author.url) {
        mergedComponents['userlink'] = <RouterLink to={author.url} />;
      } else {
        mergedComponents['userlink'] = <span />;
      }
    } else {
      mergedValues['user'] = t('common.user');
    }

    mergedValues['space'] = spaceDisplayName;

    mergedValues['invitedEntity'] =
      type === RoleSetContributorType.Virtual
        ? t('community.pendingMembership.vc')
        : t('community.pendingMembership.you');

    const truncatedParentName =
      spaceDisplayName && spaceDisplayName.length > PARENT_NAME_MAX_LENGTH
        ? spaceDisplayName.substring(0, PARENT_NAME_MAX_LENGTH).concat('…')
        : spaceDisplayName;
    if (truncatedParentName) {
      mergedValues['spaceDisplayName'] = truncatedParentName;
    }

    const SpaceIcon = spaceLevel ? spaceLevelIcon[spaceLevel] : undefined;
    if (SpaceIcon) {
      mergedComponents['parenticon'] = <SpaceIcon fontSize="small" sx={{ verticalAlign: 'bottom' }} />;
      mergedComponents['spaceicon'] = <SpaceIcon fontSize="inherit" />;
    }

    mergedComponents['parentlink'] = spaceUrl ? <RouterLink to={spaceUrl} /> : <span />;

    return {
      values: mergedValues,
      components: mergedComponents,
    };
  }, [createdDate, t, author, author?.displayName, author?.url, spaceDisplayName, spaceLevel, spaceUrl, i18nKey]);

  return (
    <>
      <Trans
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i18nKey={i18nKey as any}
        {...props}
      />
      {withLinkToParent && <Trans i18nKey="components.activityLogView.detailedDescription.parentLink" {...props} />}
    </>
  );
};

export default DetailedActivityDescription;
