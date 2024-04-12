import { ApolloError } from '@apollo/client';
import { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Theme } from '@mui/material';
import { ValueType } from '../../../../../core/utils/filtering/filterFn';
import ErrorBlock from '../../../../../core/ui/error/ErrorBlock';
import getJourneyChildrenTranslation from '../../../childJourney/getJourneyChildrenTranslation';
import PageContent from '../../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../../core/ui/list/LinksList';
import { Caption } from '../../../../../core/ui/typography';
import MembershipBackdrop from '../../../../shared/components/Backdrops/MembershipBackdrop';
import CardsLayout from '../../../../../core/ui/card/cardsLayout/CardsLayout';
import { JourneyTypeName } from '../../../JourneyTypeName';
import ChildJourneyCreate from './ChildJourneyCreate';
import Loading from '../../../../../core/ui/loading/Loading';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';
import JourneyFilter from '../../JourneyFilter/JourneyFilter';
import { Identifiable } from '../../../../../core/utils/Identifiable';
import { CONTENT_COLUMNS, SIDEBAR_COLUMNS, COLUMNS_MOBILE } from '../../../../../core/ui/themes/default/Theme';

export interface JourneySubentitiesState {
  loading: boolean;
  error?: ApolloError;
}

interface BaseChildEntity extends Identifiable {
  profile: {
    displayName: string;
    url: string;
  };
}

export interface ChildJourneyViewProps<ChildEntity extends BaseChildEntity> {
  journeyTypeName: JourneyTypeName;
  childEntities: ChildEntity[] | undefined;
  childEntitiesIcon: ReactElement;
  childEntityReadAccess?: boolean;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
  childEntityValueGetter: (childEntity: ChildEntity) => ValueType;
  childEntityTagsGetter: (childEntity: ChildEntity) => string[];
  childEntityCreateAccess?: boolean;
  childEntityOnCreate?: () => void;
  createSubentityDialog?: ReactElement;
  state: JourneySubentitiesState;
  childrenLeft?: ReactNode;
  childrenRight?: ReactNode;
}

const ChildJourneyView = <ChildEntity extends BaseChildEntity>({
  journeyTypeName,
  childEntities = [],
  childEntitiesIcon,
  childEntityReadAccess,
  renderChildEntityCard,
  childEntityValueGetter,
  childEntityTagsGetter,
  childEntityCreateAccess = false,
  childEntityOnCreate,
  createSubentityDialog,
  state,
  childrenLeft,
  childrenRight,
}: ChildJourneyViewProps<ChildEntity>) => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <MembershipBackdrop show={!childEntityReadAccess} blockName={getJourneyChildrenTranslation(t, journeyTypeName)}>
      <PageContent>
        <PageContentColumn columns={isMobile ? COLUMNS_MOBILE : SIDEBAR_COLUMNS}>
          <ChildJourneyCreate
            journeyTypeName={journeyTypeName}
            canCreateSubentity={childEntityCreateAccess}
            onCreateSubentity={childEntityOnCreate}
          />
          {createSubentityDialog}
          <PageContentBlock>
            <PageContentBlockHeader
              title={t('pages.generic.sections.subentities.list', {
                entities: getJourneyChildrenTranslation(t, journeyTypeName),
              })}
            />
            <LinksList
              items={childEntities.map(entity => ({
                id: entity.id,
                title: entity.profile.displayName,
                icon: childEntitiesIcon,
                uri: entity.profile.url,
              }))}
              emptyListCaption={t('pages.generic.sections.subentities.empty-list', {
                entities: getJourneyChildrenTranslation(t, journeyTypeName),
                parentEntity: t(`common.${journeyTypeName}` as const),
              })}
            />
          </PageContentBlock>
          {childrenLeft}
        </PageContentColumn>
        <PageContentColumn columns={isMobile ? COLUMNS_MOBILE : CONTENT_COLUMNS}>
          {state.loading && <Loading />}
          {!state.loading && childEntities.length === 0 && (
            <PageContentBlockSeamless>
              <Caption textAlign="center">
                {t('pages.generic.sections.subentities.empty', {
                  entities: getJourneyChildrenTranslation(t, journeyTypeName),
                  parentEntity: t(`common.${journeyTypeName}` as const),
                })}
              </Caption>
            </PageContentBlockSeamless>
          )}
          {!state.loading && childEntities.length > 0 && (
            <PageContentBlock>
              {childEntityReadAccess && renderChildEntityCard && (
                <JourneyFilter
                  data={childEntities}
                  valueGetter={childEntityValueGetter}
                  tagsGetter={childEntityTagsGetter}
                  title={t('common.entitiesWithCount', {
                    entityType: getJourneyChildrenTranslation(t, journeyTypeName),
                    count: childEntities.length,
                  })}
                >
                  {filteredEntities => (
                    <CardsLayout items={filteredEntities} disablePadding>
                      {renderChildEntityCard}
                    </CardsLayout>
                  )}
                </JourneyFilter>
              )}
            </PageContentBlock>
          )}
          {!state.loading && childEntities.length === 0 && childEntityCreateAccess && (
            <Button
              startIcon={<AddOutlinedIcon />}
              variant="contained"
              onClick={childEntityOnCreate}
              sx={{ width: '100%' }}
            >
              {t('common.create-new-entity', { entity: getJourneyChildrenTranslation(t, journeyTypeName, 1) })}
            </Button>
          )}
          {childrenRight}
          {state.error && <ErrorBlock blockName={t(`common.${journeyTypeName}` as const)} />}
        </PageContentColumn>
      </PageContent>
    </MembershipBackdrop>
  );
};

export default ChildJourneyView;
