import { ReactNode, ReactElement, cloneElement } from 'react';

import { ApolloError } from '@apollo/client';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import ChildJourneyCreate from './ChildJourneyCreate';
import { Caption } from '../../../../../core/ui/typography';
import Loading from '../../../../../core/ui/loading/Loading';
import JourneyFilter from '../../JourneyFilter/JourneyFilter';
import LinksList from '../../../../../core/ui/list/LinksList';
import { Actions } from '../../../../../core/ui/actions/Actions';
import ErrorBlock from '../../../../../core/ui/error/ErrorBlock';
import RoundedIcon from '../../../../../core/ui/icon/RoundedIcon';
import InfoColumn from '../../../../../core/ui/content/InfoColumn';
import PageContent from '../../../../../core/ui/content/PageContent';
import ContentColumn from '../../../../../core/ui/content/ContentColumn';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { CardLayoutContainer } from '../../../../../core/ui/card/cardsLayout/CardsLayout';
import PageContentBlockHeader from '../../../../../core/ui/content/PageContentBlockHeader';
import MembershipBackdrop from '../../../../shared/components/Backdrops/MembershipBackdrop';
import PageContentBlockSeamless from '../../../../../core/ui/content/PageContentBlockSeamless';

import { type JourneyTypeName } from '../../../JourneyTypeName';
import { useSpace } from '../../../space/SpaceContext/useSpace';
import { type ValueType } from '../../../../../core/utils/filtering/filterFn';
import { type Identifiable } from '../../../../../core/utils/Identifiable';
import getJourneyChildrenTranslation from '../../../subspace/getJourneyChildrenTranslation';

const ChildJourneyView = <ChildEntity extends BaseChildEntity>({
  state,
  children,
  onClickCreate,
  journeyTypeName,
  childEntitiesIcon,
  childEntities = [],
  childEntityOnCreate,
  childEntityReadAccess,
  renderChildEntityCard,
  childEntityTagsGetter,
  createSubentityDialog,
  childEntityValueGetter,
  childEntityCreateAccess = false,
}: ChildJourneyViewProps<ChildEntity>) => {
  const { t } = useTranslation();
  const { permissions } = useSpace();

  return (
    <MembershipBackdrop show={!childEntityReadAccess} blockName={getJourneyChildrenTranslation(t, journeyTypeName)}>
      <PageContent>
        <InfoColumn>
          <ChildJourneyCreate
            journeyTypeName={journeyTypeName}
            onCreateSubentity={childEntityOnCreate}
            canCreateSubentity={childEntityCreateAccess}
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
  state: JourneySubentitiesState;
  childEntitiesIcon: ReactElement;
  journeyTypeName: JourneyTypeName;
  childEntities: ChildEntity[] | undefined;
  childEntityTagsGetter: (childEntity: ChildEntity) => string[];
  childEntityValueGetter: (childEntity: ChildEntity) => ValueType;

  children?: ReactNode;
  childEntityReadAccess?: boolean;
  childEntityCreateAccess?: boolean;
  createSubentityDialog?: ReactElement;
  childEntityOnCreate?: () => void;
  onClickCreate?: (isOpen: boolean) => void;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
}
