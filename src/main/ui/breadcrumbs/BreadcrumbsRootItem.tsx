import { useTranslation } from 'react-i18next';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import type { Expandable } from '@/core/ui/navigation/Expandable';
import useBreadcrumbsTopLevelItem from '@/domain/innovationHub/useSpaceBreadcrumbsTopLevelItem';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import AlkemioLogo from '../logo/logoSmall.svg?react';

const Logo = () => <AlkemioLogo />;

interface BreadcrumbsRootItemProps extends Expandable {
  size?: 'medium' | 'large';
}

const BreadcrumbsRootItem = ({ size, ...props }: BreadcrumbsRootItemProps) => {
  const { t } = useTranslation();

  const { profile, loading } = useBreadcrumbsTopLevelItem();

  return (
    <BreadcrumbsItem
      uri={ROUTE_HOME}
      avatar={profile?.bannerWide}
      iconComponent={profile ? undefined : Logo}
      loading={loading}
      size={size}
      {...props}
    >
      {profile?.displayName ?? t('pages.home.title')}
    </BreadcrumbsItem>
  );
};

export default BreadcrumbsRootItem;
