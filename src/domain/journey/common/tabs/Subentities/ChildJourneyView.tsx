import { ApolloError } from '@apollo/client';
import { ReactElement, ReactNode, cloneElement } from 'react';
import { useTranslation } from 'react-i18next';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ValueType } from '@/core/utils/filtering/filterFn';
import ErrorBlock from '@/core/ui/error/ErrorBlock';
import getJourneyChildrenTranslation from '../../../subspace/getJourneyChildrenTranslation';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import LinksList from '@/core/ui/list/LinksList';
import { Caption } from '@/core/ui/typography';
import MembershipBackdrop from '../../../../shared/components/Backdrops/MembershipBackdrop';
import { CardLayoutContainer } from '@/core/ui/card/cardsLayout/CardsLayout';
import { JourneyTypeName } from '../../../JourneyTypeName';
import ChildJourneyCreate from './ChildJourneyCreate';
import Loading from '@/core/ui/loading/Loading';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import JourneyFilter from '../../JourneyFilter/JourneyFilter';
import { Identifiable } from '@/core/utils/Identifiable';
import { Actions } from '@/core/ui/actions/Actions';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { useSpace } from '../../../space/SpaceContext/useSpace';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';

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
  children?: ReactNode;
  onClickCreate?: (isOpen: boolean) => void;
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
  children,
  onClickCreate,
}: ChildJourneyViewProps<ChildEntity>) => {
  const { t } = useTranslation();
  const { permissions } = useSpace();

  return (
    <MembershipBackdrop show={!childEntityReadAccess} blockName={getJourneyChildrenTranslation(t, journeyTypeName)}>
      <PageContent>
        <InfoColumn>
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
        </InfoColumn>
        <ContentColumn>
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
                    <CardLayoutContainer disablePadding>
                      {filteredEntities.map((item, index) => {
                        const key = item ? item.id : `__loading_${index}`;
                        return cloneElement(renderChildEntityCard(item), { key });
                      })}
                      {permissions.canCreateSubspaces && (
                        <Actions sx={{ justifyContent: 'flex-end', width: '100%' }}>
                          <IconButton aria-label={t('common.add')} size="small" onClick={() => onClickCreate?.(true)}>
                            <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
                          </IconButton>
                        </Actions>
                      )}
                    </CardLayoutContainer>
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
          {children}
          {state.error && <ErrorBlock blockName={t(`common.${journeyTypeName}` as const)} />}
        </ContentColumn>
      </PageContent>
    </MembershipBackdrop>
  );
};

export default ChildJourneyView;
