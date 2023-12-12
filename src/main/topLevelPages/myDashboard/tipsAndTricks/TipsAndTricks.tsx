import { FC } from 'react';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../core/ui/content/SeeMore';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import LinkNoUnderline from '../../../../domain/shared/components/LinkNoUnderline';
import { Caption } from '../../../../core/ui/typography';

interface TipsAndTricksProps {}

const TipsAndTricks: FC<TipsAndTricksProps> = () => {
  const { t } = useTranslation();

  const items = t('pages.home.sections.tipsAndTricks.items', { returnObjects: true });

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.home.sections.tipsAndTricks.title')} />
      {items.map((item, index) => (
        <BadgeCardView
          key={index}
          visual={
            <Avatar src={item.imageUrl} alt={t('common.avatar-of', { user: item.title })}>
              {item.title}
            </Avatar>
          }
          component={LinkNoUnderline}
          to={item.url}
        >
          <Caption>{item.title}</Caption>
          <Caption>{item.description}</Caption>
        </BadgeCardView>
      ))}
      <SeeMore label="pages.home.sections.tipsAndTricks.findMore" to="/forum" />
    </PageContentBlock>
  );
};

export default TipsAndTricks;
