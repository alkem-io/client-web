import React, { useMemo, useCallback } from 'react';
import { groupBy } from 'lodash';
import { Button, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import VCProfileContentView from './VCProfileContentView';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption, CardText } from '@/core/ui/typography';
import References from '@/domain/shared/components/References/References';
import { isSocialNetworkSupported } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import { gutters } from '@/core/ui/grid/utils';
import useNavigate from '@/core/routing/useNavigate';
import { KNOWLEDGE_BASE_PATH } from '@/main/routing/urlBuilders';
import useKnowledgeBase from '../knowledgeBase/useKnowledgeBase';
import {
  AiPersonaEngine,
  SpaceLevel,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import SpaceCardHorizontal from '@/domain/space/components/cards/SpaceCardHorizontal';
import { VirtualContributorModelFull } from '../model/VirtualContributorModelFull';
import { SpaceBodyOfKnowledgeModel } from '../model/SpaceBodyOfKnowledgeModel';
import { EMPTY_MODEL_CARD } from '../model/VirtualContributorModelCardModel';
import { useScreenSize } from '@/core/ui/grid/constants';

const OTHER_LINK_GROUP = 'other';
const SOCIAL_LINK_GROUP = 'social';
const bokVisitButtonStyles = { width: 'fit-content', marginTop: gutters(1) };

export type VCProfilePageViewProps = {
  bokProfile?: SpaceBodyOfKnowledgeModel;
  virtualContributor?: VirtualContributorModelFull;
  navigateToKnowledgeBase?: boolean;
  openKnowledgeBaseDialog?: boolean;
};

export const VCProfilePageView = ({ virtualContributor, ...rest }: VCProfilePageViewProps) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { isMediumSmallScreen } = useScreenSize();

  const { hasReadAccess, knowledgeBaseDescription } = useKnowledgeBase({ id: virtualContributor?.id });

  const modelCard = virtualContributor?.modelCard || EMPTY_MODEL_CARD;

  const references = virtualContributor?.profile?.references;
  const bodyOfKnowledgeType = virtualContributor?.bodyOfKnowledgeType;
  const engine = virtualContributor?.aiPersona?.engine;

  const isExternal = modelCard.aiEngine.isExternal;

  const hasSpaceKnowledge = bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioSpace;
  const hasKnowledgeBase = bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase;
  const isAssistant = engine === AiPersonaEngine.OpenaiAssistant;

  const links = useMemo(() => {
    return groupBy(references, reference =>
      isSocialNetworkSupported(reference.name) ? SOCIAL_LINK_GROUP : OTHER_LINK_GROUP
    );
  }, [references]);

  const onClickHandleKnowledgeBase = useCallback(() => {
    if (virtualContributor) {
      navigate(`${virtualContributor.profile.url}/${KNOWLEDGE_BASE_PATH}`);
    }
  }, [navigate, virtualContributor]);

  const defaultProfile = { displayName: t('components.card.privacy.private', { entity: 'space' }), url: '' };

  const renderBokVisitButton = useCallback(
    () =>
      hasReadAccess ? (
        <Button color="primary" variant="outlined" sx={bokVisitButtonStyles} onClick={onClickHandleKnowledgeBase}>
          {t('buttons.visit')}
        </Button>
      ) : (
        <Tooltip title={t('components.profile.fields.bodyOfKnowledge.privateBokTooltip')} placement="bottom-start">
          <Gutters disableGap disablePadding>
            <Button disabled color="primary" variant="outlined" sx={bokVisitButtonStyles}>
              {t('buttons.visit')}
            </Button>
          </Gutters>
        </Tooltip>
      ),
    [hasReadAccess, t, onClickHandleKnowledgeBase]
  );

  return (
    <PageContent>
      <PageContentColumn columns={isMediumSmallScreen ? 12 : 3}>
        <PageContentBlock disableGap>
          <ProfileDetail
            title={t('components.profile.fields.description.title')}
            value={virtualContributor?.profile?.description ?? ''}
            aria-label="description"
          />
        </PageContentBlock>

        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.virtualContributorProfile.host')} />
          <ContributorCardHorizontal profile={virtualContributor?.provider?.profile} seamless />
        </PageContentBlock>

        <PageContentBlock>
          <Gutters disableGap disablePadding>
            <Gutters disableGap disablePadding marginBottom={gutters(1)}>
              <ProfileDetail title={t('components.profile.fields.references.title')} aria-label="references" />
            </Gutters>

            <References
              references={links[OTHER_LINK_GROUP]}
              noItemsView={<CardText color="neutral.main">{t('common.no-references')}</CardText>}
            />
          </Gutters>
        </PageContentBlock>

        {hasKnowledgeBase && (
          <PageContentBlock>
            <Gutters disableGap disablePadding>
              <Gutters disableGap disablePadding>
                <ProfileDetail
                  title={t('components.profile.fields.bodyOfKnowledge.title')}
                  value={knowledgeBaseDescription || t('virtualContributorSpaceSettings.placeholder')}
                  aria-label="body-of-knowledge"
                />

                {renderBokVisitButton()}
              </Gutters>
            </Gutters>
          </PageContentBlock>
        )}

        {hasSpaceKnowledge && (
          <PageContentBlock>
            <Gutters disableGap disablePadding>
              <Gutters disableGap disablePadding>
                <ProfileDetail
                  title={t('components.profile.fields.bodyOfKnowledge.title')}
                  value={virtualContributor?.bodyOfKnowledgeDescription || ''}
                  aria-label="body-of-knowledge"
                />

                <Caption sx={{ marginTop: gutters(1) }}>
                  {t('components.profile.fields.bodyOfKnowledge.spaceBokDescription', {
                    vcName: virtualContributor?.profile?.displayName,
                  })}
                </Caption>

                <Gutters disableGap disablePadding paddingTop={1}>
                  <SpaceCardHorizontal
                    space={{
                      id: virtualContributor?.bodyOfKnowledgeID,
                      about: { profile: rest?.bokProfile || defaultProfile },
                      level: SpaceLevel.L0,
                    }}
                    size="small"
                    deepness={0}
                    seamless
                    sx={{ display: 'inline-block', maxWidth: '100%', padding: 0 }}
                    disableHoverState
                    disableTagline
                  />
                </Gutters>
              </Gutters>
            </Gutters>
          </PageContentBlock>
        )}

        {isExternal && (
          <PageContentBlock>
            <Gutters disableGap disablePadding>
              <Gutters disableGap disablePadding>
                <ProfileDetail
                  title={t('components.profile.fields.bodyOfKnowledge.title')}
                  value={t('components.profile.fields.engines.externalVCDescription', {
                    engineName: isAssistant
                      ? t('components.profile.fields.engines.externalAssistant')
                      : t('components.profile.fields.engines.external'),
                  })}
                  aria-label="body-of-knowledge"
                />
              </Gutters>
            </Gutters>
          </PageContentBlock>
        )}
      </PageContentColumn>

      <PageContentColumn columns={9}>
        <VCProfileContentView virtualContributor={virtualContributor} {...rest} />
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;
