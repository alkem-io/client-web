import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { Actions } from '@/core/ui/actions/Actions';
import { CardLayoutContainer } from '@/domain/collaboration/callout/components/CardsLayout';
import ContentColumn from '@/core/ui/content/ContentColumn';
import InfoColumn from '@/core/ui/content/InfoColumn';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import ErrorBlock from '@/core/ui/error/ErrorBlock';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import SubspaceLinkList from '@/core/ui/list/SubspaceLinkList';
import Loading from '@/core/ui/loading/Loading';
import SearchField from '@/core/ui/search/SearchField';
import { Caption } from '@/core/ui/typography';
import { Identifiable } from '@/core/utils/Identifiable';
import { ValueType } from '@/core/utils/filtering/filterFn';
import SpaceFilter from '@/domain/space/components/SpaceFilter';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { ApolloError } from '@apollo/client';
import AddIcon from '@mui/icons-material/Add';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button, IconButton } from '@mui/material';
import { ReactElement, ReactNode, cloneElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateSubspaceBlock from './CreateSubspaceBlock';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import { getDefaultSpaceVisualUrl } from '../../icons/defaultVisualUrls';
import { useSpace } from '@/domain/space/context/useSpace';

export interface SubspacesState {
  loading: boolean;
  error?: ApolloError;
}

interface BaseChildEntity extends Identifiable {
  about: SpaceAboutLightModel;
}

export interface SubspaceViewProps<ChildEntity extends BaseChildEntity> {
  childEntities: ChildEntity[] | undefined;
  childEntitiesIcon: ReactElement;
  level: SpaceLevel;
  renderChildEntityCard?: (childEntity: ChildEntity) => ReactElement;
  childEntityValueGetter: (childEntity: ChildEntity) => ValueType;
  childEntityTagsGetter: (childEntity: ChildEntity) => string[];
  childEntityCreateAccess?: boolean;
  childEntityOnCreate?: () => void;
  createSubentityDialog?: ReactElement;
  state: SubspacesState;
  children?: ReactNode;
  onClickCreate?: (isOpen: boolean) => void;
}

const SubspaceView = <ChildEntity extends BaseChildEntity>({
  childEntities = [],
  childEntitiesIcon,
  level,
  renderChildEntityCard,
  childEntityValueGetter,
  childEntityTagsGetter,
  childEntityCreateAccess = false,
  childEntityOnCreate,
  createSubentityDialog,
  state,
  children,
  onClickCreate,
}: SubspaceViewProps<ChildEntity>) => {
  const [filter, setFilter] = useState('');
  const { permissions } = useSpace();
  const { t } = useTranslation();
  const { tabDescription } = useSpaceTabProvider({ tabPosition: 2 });
  const filteredItems = useMemo(
    () =>
      childEntities
        .map(entity => ({
          id: entity.id,
          title: entity.about.profile.displayName,
          icon: childEntitiesIcon,
          uri: entity.about.profile.url,
          cardBanner: entity.about.profile?.cardBanner?.uri || getDefaultSpaceVisualUrl(VisualType.Avatar, entity.id),
          isPrivate: !entity.about.isContentPublic,
        }))
        .filter(ss => ss.title.toLowerCase().includes(filter.toLowerCase())),
    [childEntities, filter, childEntitiesIcon]
  );

  return (
    <PageContent>
      <InfoColumn>
        <CreateSubspaceBlock
          tabDescription={tabDescription}
          canCreateSubentity={childEntityCreateAccess}
          onCreateSubentity={childEntityOnCreate}
        />
        {createSubentityDialog}
        <PageContentBlock>
          {childEntities.length > 3 && (
            <SearchField
              value={filter}
              placeholder={t('pages.generic.sections.subEntities.searchPlaceholder')}
              onChange={event => setFilter(event.target.value)}
            />
          )}

          <SubspaceLinkList items={filteredItems} />
        </PageContentBlock>
      </InfoColumn>
      <ContentColumn>
        {state.loading && <Loading />}
        {!state.loading && childEntities.length === 0 && (
          <PageContentBlockSeamless>
            <Caption textAlign="center">
              {t('pages.generic.sections.subEntities.empty', {
                entities: t('common.space-level.L1'),
                parentEntity: t(`common.space-level.${level}`),
              })}
            </Caption>
          </PageContentBlockSeamless>
        )}
        {!state.loading && childEntities.length > 0 && (
          <PageContentBlock>
            {renderChildEntityCard && (
              <SpaceFilter
                data={childEntities}
                valueGetter={childEntityValueGetter}
                tagsGetter={childEntityTagsGetter}
                title={t('common.entitiesWithCount', {
                  entityType: t('common.space-level.L1'),
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
              </SpaceFilter>
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
            {t('common.create-new-entity', { entity: t(`common.space-level.${level}`) })}
          </Button>
        )}
        {children}
        {state.error && <ErrorBlock blockName={t(`common.space-level.${level}`)} />}
      </ContentColumn>
    </PageContent>
  );
};

export default SubspaceView;
