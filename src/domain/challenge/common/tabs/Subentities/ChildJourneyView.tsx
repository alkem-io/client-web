import { ApolloError } from '@apollo/client';
import { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CardFilter from '../../../../../common/components/core/card-filter/CardFilter';
import { ValueType } from '../../../../../common/components/core/card-filter/filterFn';
import ErrorBlock from '../../../../../common/components/core/ErrorBlock';
import getJourneyChildrenTranslationKey from '../../../../../common/utils/translation/getJourneyChildrenTranslationKey';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../../core/ui/list/LinksList';
import { Caption } from '../../../../../core/ui/typography';
import MembershipBackdrop from '../../../../shared/components/Backdrops/MembershipBackdrop';
import CardsLayout from '../../../../../core/ui/card/CardsLayout/CardsLayout';
import { CoreEntityIdTypes } from '../../../../shared/types/CoreEntityIds';
import { NameableEntity } from '../../../../shared/types/NameableEntity';
import { JourneyTypeName } from '../../../JourneyTypeName';
import ChildJourneyCreate from './ChildJourneyCreate';
import { Loading } from '../../../../../common/components/core';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';

export interface JourneySubentitiesState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChildJourneyViewProps<ChildEntity extends NameableEntity> extends Partial<CoreEntityIdTypes> {
  journeyTypeName: JourneyTypeName;
  childEntities: ChildEntity[] | undefined;
  childEntitiesIcon: ReactElement;
  childEntityReadAccess?: boolean;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
  childEntityValueGetter: (childEntity: ChildEntity) => ValueType;
  childEntityTagsGetter: (childEntity: ChildEntity) => string[];
  getChildEntityUrl: (childEntity: ChildEntity) => string;
  childEntityCreateAccess?: boolean;
  childEntityOnCreate?: () => void;
  createSubentityDialog?: ReactElement;
  state: JourneySubentitiesState;
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
}

const ChildJourneyView = <ChildEntity extends NameableEntity>({
  hubNameId,
  journeyTypeName,
  childEntities = [],
  childEntitiesIcon,
  childEntityReadAccess,
  renderChildEntityCard,
  childEntityValueGetter,
  childEntityTagsGetter,
  getChildEntityUrl,
  childEntityCreateAccess = false,
  childEntityOnCreate,
  createSubentityDialog,
  state,
  childrenLeft,
  childrenRight,
}: ChildJourneyViewProps<ChildEntity>) => {
  const { t } = useTranslation();

  return (
    <MembershipBackdrop show={!childEntityReadAccess} blockName={t(`common.${journeyTypeName}` as const)}>
      <PageContent>
        <PageContentColumn columns={4}>
          <ChildJourneyCreate
            journeyTypeName={journeyTypeName}
            canCreateSubentity={childEntityCreateAccess}
            onCreateSubentity={childEntityOnCreate}
          />
          {createSubentityDialog}
          <PageContentBlock>
            <PageContentBlockHeader
              title={t('pages.generic.sections.subentities.list', {
                entities: t(getJourneyChildrenTranslationKey(journeyTypeName)),
              })}
            />
            <LinksList
              items={childEntities.map(entity => ({
                id: entity.id,
                title: entity.profile.displayName,
                icon: childEntitiesIcon,
                uri: getChildEntityUrl(entity),
              }))}
              emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                entities: t(getJourneyChildrenTranslationKey(journeyTypeName)),
                parentEntity: t(`common.${journeyTypeName}` as const),
              })}
            />
          </PageContentBlock>
          {childrenLeft}
        </PageContentColumn>
        <PageContentColumn columns={8}>
          {state.loading && <Loading />}
          {!state.loading && childEntities.length === 0 && (
            <PageContentBlockSeamless>
              <Caption textAlign="center">
                {t('pages.generic.sections.subentities.empty', {
                  entities: t(getJourneyChildrenTranslationKey(journeyTypeName)),
                  parentEntity: t(`common.${journeyTypeName}` as const),
                })}
              </Caption>
            </PageContentBlockSeamless>
          )}
          {!state.loading && childEntities.length > 0 && (
            <PageContentBlock>
              {childEntityReadAccess && renderChildEntityCard && (
                <CardFilter
                  data={childEntities}
                  valueGetter={childEntityValueGetter}
                  tagsValueGetter={childEntityTagsGetter}
                  keepOpen={false}
                >
                  {filteredEntities => (
                    <CardsLayout items={filteredEntities} deps={[hubNameId]} disablePadding>
                      {renderChildEntityCard}
                    </CardsLayout>
                  )}
                </CardFilter>
              )}
            </PageContentBlock>
          )}
          {childrenRight}
          {state.error && <ErrorBlock blockName={t(`common.${journeyTypeName}` as const)} />}
        </PageContentColumn>
      </PageContent>
    </MembershipBackdrop>
  );
};

export default ChildJourneyView;
