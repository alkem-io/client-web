import { useJourneyBreadcrumbs, UseJourneyBreadcrumbsParams } from './useJourneyBreadcrumbs';
import Breadcrumbs, { BreadcrumbsProps } from '@/core/ui/navigation/Breadcrumbs';
import { spaceLevelIcon } from '@/domain/shared/components/SpaceIcon/SpaceIcon';
import BreadcrumbsRootItem from '@/main/ui/breadcrumbs/BreadcrumbsRootItem';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { Expandable } from '@/core/ui/navigation/Expandable';
import { forwardRef, ReactElement, Ref } from 'react';
import { Collapsible } from '@/core/ui/navigation/Collapsible';
import { Settings } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface JourneyBreadcrumbsProps<ItemProps extends Expandable>
  extends BreadcrumbsProps<ItemProps>,
    UseJourneyBreadcrumbsParams {
  settings?: boolean;
}

const JourneyBreadcrumbs = forwardRef<Collapsible, JourneyBreadcrumbsProps<Expandable>>(
  <ItemProps extends Expandable>(
    { journeyPath, settings, loading, ...props }: JourneyBreadcrumbsProps<ItemProps>,
    ref
  ) => {
    const { breadcrumbs } = useJourneyBreadcrumbs({
      journeyPath,
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
  props: JourneyBreadcrumbsProps<ItemProps> & { ref?: Ref<Collapsible> }
) => ReactElement;

export default JourneyBreadcrumbs;
