import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { JourneyLocation } from '../../../../../common/utils/urlBuilders';
import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import CardsLayout from '../../../../shared/layout/CardsLayout/CardsLayout';
import withOptionalCount from '../../../../shared/utils/withOptionalCount';
import EntityDashboardLeadsSection from '../../../../community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection';
import { ActivityComponent, ActivityLogResultType } from '../../../../shared/components/ActivityLog';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import SeeMore from '../../../../../core/ui/content/SeeMore';
import JourneySubentityCreate from './JourneySubentityCreate';
import { CoreEntityIdTypes } from '../../../../shared/types/CoreEntityIds';
import { NameableEntity } from '../../../../shared/types/NameableEntity';
import { JourneyTypeName } from '../../../JourneyTypeName';
import LinksList from '../../../../../core/ui/list/LinksList';
import CardFilter from '../../../../../common/components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../../../../common/components/core/card-filter/value-getters/entity-value-getter';

export interface JourneyDashboardViewProps<ChildEntity extends NameableEntity>
  extends EntityDashboardContributors,
    EntityDashboardLeads,
    Partial<CoreEntityIdTypes> {
  activities: ActivityLogResultType[] | undefined;
  activityLoading: boolean;
  childEntities?: ChildEntity[];
  childEntitiesIcon?: ReactElement;
  childEntityReadAccess?: boolean;
  childEntitiesCount?: number;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
  getChildEntityUrl: (childEntity: ChildEntity) => string;
  journeyTypeName: JourneyTypeName;
  childEntityTitle?: string;
}

const JourneySubentitiesView = <ChildEntity extends NameableEntity>({
  hubNameId,
  challengeNameId,
  opportunityNameId,
  childEntitiesCount,
  childEntityReadAccess = false,
  activities,
  activityLoading,
  childEntities = [],
  childEntitiesIcon,
  getChildEntityUrl,
  renderChildEntityCard,
  journeyTypeName,
  childEntityTitle,
}: JourneyDashboardViewProps<ChildEntity>) => {
  const { t } = useTranslation();

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <JourneySubentityCreate journeyTypeName={journeyTypeName} />
        <PageContentBlock>
          <PageContentBlockHeader
            title={t('pages.generic.sections.subentities.list', { entities: t('common.opportunities') })}
          />
          <LinksList
            items={childEntities.map(entity => ({
              id: entity.id,
              title: entity.displayName,
              url: getChildEntityUrl(entity),
              icon: childEntitiesIcon,
            }))}
            emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
              entities: t('common.opportunities'),
              parentEntity: t('common.challenge'),
            })}
          />
        </PageContentBlock>
      </PageContentColumn>

      <PageContentColumn columns={8}>
        {!state.loading && childEntities.length === 0 ? (
          <Text>{t('pages.challenge.sections.opportunities.body-missing')}</Text>
        ) : (
          <CardFilter data={childEntities} tagsValueGetter={entityTagsValueGetter} valueGetter={entityValueGetter}>
            {filteredData => (
              <CardsLayout items={filteredData} deps={[hubNameId]}>
                {renderChildEntityCard}
              </CardsLayout>
            )}
          </CardFilter>
        )}
      </PageContentColumn>
    </PageContent>
  );
};

export default JourneySubentitiesView;
