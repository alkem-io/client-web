import AlkemioLogo from '../logo/logoSmall.svg?react';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import useJourneyBreadcrumbsTopLevelItem from '@/domain/space/components/journeyBreadcrumbs/useJourneyBreadcrumbsTopLevelItem';
import { Expandable } from '@/core/ui/navigation/Expandable';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useTranslation } from 'react-i18next';

const Logo = () => <AlkemioLogo />;

const BreadcrumbsRootItem = (props: Expandable) => {
  const { t } = useTranslation();

  const { profile, loading } = useJourneyBreadcrumbsTopLevelItem();

  return (
    <BreadcrumbsItem
      uri={ROUTE_HOME}
      avatar={profile?.avatar}
      iconComponent={profile ? undefined : Logo}
      loading={loading}
      {...props}
    >
      {profile?.displayName ?? t('pages.home.title')}
    </BreadcrumbsItem>
  );
};

export default BreadcrumbsRootItem;
