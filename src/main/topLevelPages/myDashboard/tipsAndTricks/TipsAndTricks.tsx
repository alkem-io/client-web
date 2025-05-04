import { useTranslation } from 'react-i18next';
import SeeMore from '@/core/ui/content/SeeMore';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import Avatar from '@/core/ui/avatar/Avatar';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';

export const TipsAndTricks = () => {
  const { t } = useTranslation();

  const itemsRaw = t('pages.home.sections.tipsAndTricks.items', { returnObjects: true });
  const items = Array.isArray(itemsRaw) ? itemsRaw : Object.values(itemsRaw);

  return (
    <Gutters disablePadding>
      {items.map((item, index) => (
        <BadgeCardView
          key={index}
          visual={
            <Avatar src={item.imageUrl} alt={t('common.avatar-of', { user: item.title })}>
              {item.title}
            </Avatar>
          }
          component={RouterLink}
          to={item.url}
        >
          <Caption>{item.title}</Caption>
          <Caption>{item.description}</Caption>
        </BadgeCardView>
      ))}
      <SeeMore label="pages.home.sections.tipsAndTricks.findMore" to="/forum" />
    </Gutters>
  );
};
