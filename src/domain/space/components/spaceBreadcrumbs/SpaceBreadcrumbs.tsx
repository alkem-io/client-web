import { useSpaceBreadcrumbs, UseSpaceBreadcrumbsParams } from './useSpaceBreadcrumbs';
import Breadcrumbs, { BreadcrumbsProps } from '@/core/ui/navigation/Breadcrumbs';
import { spaceLevelIcon } from '@/domain/space/icons/SpaceIconByLevel';
import BreadcrumbsRootItem from '@/main/ui/breadcrumbs/BreadcrumbsRootItem';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { Expandable } from '@/core/ui/navigation/Expandable';
import { forwardRef, ReactElement, Ref } from 'react';
import { Collapsible } from '@/core/ui/navigation/Collapsible';
import { Settings } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SpaceBreadcrumbsProps<ItemProps extends Expandable>
  extends BreadcrumbsProps<ItemProps>,
    UseSpaceBreadcrumbsParams {
  settings?: boolean;
}

const SpaceBreadcrumbs = forwardRef<Collapsible, SpaceBreadcrumbsProps<Expandable>>(
  <ItemProps extends Expandable>(
    { spaceHierarchyPath, settings, loading, ...props }: SpaceBreadcrumbsProps<ItemProps>,
    ref
  ) => {
    const { breadcrumbs } = useSpaceBreadcrumbs({
      spaceHierarchyPath,
      loading,
    });

    const { t } = useTranslation();

    return (
      <Breadcrumbs ref={ref} {...props}>
        <BreadcrumbsRootItem />
        {breadcrumbs.map(({ displayName, level, ...item }) => (
          <BreadcrumbsItem key={level} iconComponent={spaceLevelIcon[level]} accent aria-label={displayName} {...item}>
            {displayName}
          </BreadcrumbsItem>
        ))}
        {settings && (
          <BreadcrumbsItem iconComponent={Settings} aria-label={t('common.settings')}>
            {t('common.settings')}
          </BreadcrumbsItem>
        )}
      </Breadcrumbs>
    );
  }
) as <ItemProps extends Expandable>(
  props: SpaceBreadcrumbsProps<ItemProps> & { ref?: Ref<Collapsible> }
) => ReactElement;

export default SpaceBreadcrumbs;
