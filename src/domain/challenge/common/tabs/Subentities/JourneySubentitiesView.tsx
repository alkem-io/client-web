import { ApolloError } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { ReactElement } from 'react';
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
import { Text } from '../../../../../core/ui/typography';
import MembershipBackdrop from '../../../../shared/components/Backdrops/MembershipBackdrop';
import CardsLayout from '../../../../../core/ui/card/CardsLayout/CardsLayout';
import { CoreEntityIdTypes } from '../../../../shared/types/CoreEntityIds';
import { NameableEntity } from '../../../../shared/types/NameableEntity';
import { JourneyTypeName } from '../../../JourneyTypeName';
import JourneySubentityCreate from './JourneySubentityCreate';

export interface JourneySubentitiesState {
  loading: boolean;
  error?: ApolloError;
}

export interface JourneySubentitiesViewProps<ChildEntity extends NameableEntity> extends Partial<CoreEntityIdTypes> {
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
}

const JourneySubentitiesView = <ChildEntity extends NameableEntity>({
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
}: JourneySubentitiesViewProps<ChildEntity>) => {
  const { t } = useTranslation();

  return (
    <MembershipBackdrop show={!childEntityReadAccess} blockName={t(`common.${journeyTypeName}` as const)}>
      <PageContent>
        <PageContentColumn columns={4}>
          <JourneySubentityCreate
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
                title: entity.displayName,
                icon: childEntitiesIcon,
                uri: getChildEntityUrl(entity),
              }))}
              emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                entities: t(getJourneyChildrenTranslationKey(journeyTypeName)),
                parentEntity: t(`common.${journeyTypeName}` as const),
              })}
            />
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={8}>
          {childEntityReadAccess && renderChildEntityCard && (
            <PageContentBlock>
              {state.loading && <Skeleton variant="rectangular" />}
              {!state.loading && childEntities.length === 0 && (
                <Text>
                  {t('pages.generic.sections.subentities.empty', {
                    entities: t(getJourneyChildrenTranslationKey(journeyTypeName)),
                    parentEntity: t(`common.${journeyTypeName}` as const),
                  })}
                </Text>
              )}
              {!state.loading && childEntities.length > 0 && (
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
          {state.error && <ErrorBlock blockName={t(`common.${journeyTypeName}` as const)} />}
        </PageContentColumn>
      </PageContent>
    </MembershipBackdrop>
  );
};

export default JourneySubentitiesView;
