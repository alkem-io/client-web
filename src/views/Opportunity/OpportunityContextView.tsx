import { ApolloError } from '@apollo/client';
import { Box, Button, Link, Typography } from '@mui/material';
import { ReactComponent as CardListIcon } from 'bootstrap-icons/icons/card-list.svg';
import { ReactComponent as NodePlusIcon } from 'bootstrap-icons/icons/node-plus.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import ActorGroupCreateModal from '../../components/composite/entities/Opportunity/ActorGroupCreateModal';
import {
  ActorCard,
  AspectCard,
  NewActorCard,
  NewAspectCard,
} from '../../components/composite/entities/Opportunity/Cards';
import ContextLayout from '../../components/composite/layout/Context/ContextLayout';
import ContextSection from '../../components/composite/sections/ContextSection';
import LifecycleSection from '../../components/composite/sections/LifecycleSection';
import { CardContainer } from '../../components/core/CardContainer';
import Icon from '../../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { SectionSpacer } from '../../components/core/Section/Section';
import { Context, OpportunityPageFragment, Reference } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { replaceAll } from '../../utils/replaceAll';
import { getVisualBanner } from '../../utils/visuals.utils';

export interface OpportunityContextViewEntities {
  opportunity: OpportunityPageFragment;
  availableActorGroupNames: string[];
  existingAspectNames: string[];
  meme?: Reference;
}

export interface OpportunityContextViewActions {
  onAddActorGroupOpen: () => void;
  onAddActorGroupClose: () => void;
  onMemeError: () => void;
}

export interface OpportunityContextViewState {
  showActorGroupModal: boolean;
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityContextViewOptions {
  editAspect: boolean;
  editActorGroup: boolean;
  editActors: boolean;
  removeRelations: boolean;
  isMemberOfOpportunity: boolean;
  isNoRelations: boolean;
  isAspectAddAllowed: boolean;
  isAuthenticated: boolean;
}

export interface OpportunityContextViewProps
  extends ViewProps<
    OpportunityContextViewEntities,
    OpportunityContextViewActions,
    OpportunityContextViewState,
    OpportunityContextViewOptions
  > {}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ entities, options, actions, state }) => {
  const { t } = useTranslation();

  const opportunity = entities.opportunity;
  const { context, displayName, tagset, id } = opportunity;

  const {
    tagline = '',
    impact = '',
    background = '',
    vision = '',
    who = '',
    references,
    aspects = [],
  } = context || ({} as Context);
  const contextId = context?.id ?? '';
  const ecosystemModelId = context?.ecosystemModel?.id ?? '';
  const banner = getVisualBanner(context?.visuals);
  const lifecycle = opportunity?.lifecycle;
  const actorGroups = context?.ecosystemModel?.actorGroups ?? [];

  const rightPanel = (
    <>
      <LifecycleSection lifecycle={lifecycle} />
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.profile.fields.keywords.title')}>
        <TagsComponent tags={tagset?.tags || []} />
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.referenceSegment.title')}>
        {references?.map((l, i) => (
          <Link key={i} href={l.uri} target="_blank">
            <Typography>{l.uri}</Typography>
          </Link>
        ))}
      </DashboardGenericSection>
    </>
  );

  return (
    <ContextLayout rightPanel={rightPanel}>
      <ContextSection
        banner={banner}
        background={background}
        displayName={displayName}
        impact={impact}
        tagline={tagline}
        vision={vision}
        who={who}
      />
      <SectionSpacer />
      <Section hideDetails avatar={<Icon component={NodePlusIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.adoption-ecosystem.header')}>
          {options.editActorGroup && entities.availableActorGroupNames.length > 0 && (
            <Box marginLeft={3}>
              <Button variant="outlined" onClick={actions.onAddActorGroupOpen}>
                {t('pages.opportunity.sections.adoption-ecosystem.buttons.add-actor-group.text')}
              </Button>
            </Box>
          )}
        </SectionHeader>
        <SubHeader text={t('pages.opportunity.sections.adoption-ecosystem.subheader')} />
      </Section>

      {actorGroups
        .filter(ag => ag.name !== 'collaborators') // TODO: remove when collaborators are deleted from actorGroups on server
        .map(({ id: actorGroupId, actors = [], name }, index) => {
          const _name = replaceAll('_', ' ', name);
          return (
            <CardContainer
              key={index}
              cardHeight={260}
              xs={12}
              md={6}
              lg={4}
              xl={3}
              title={_name}
              fullHeight
              withCreate={<NewActorCard opportunityId={id} text={`Add ${_name}`} actorGroupId={actorGroupId} />}
            >
              {actors?.map((props, i) => (
                <ActorCard key={i} opportunityId={id} isAdmin={options.editActors} {...props} />
              ))}
            </CardContainer>
          );
        })}

      <Section hideDetails avatar={<Icon component={CardListIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.opportunity.sections.solution.header')} />
        <SubHeader text={t('pages.opportunity.sections.solution.subheader')} />
      </Section>

      {aspects && (
        <CardContainer
          xs={12}
          md={6}
          lg={4}
          xl={3}
          withCreate={
            options.isAspectAddAllowed && (
              <NewAspectCard
                opportunityId={id}
                contextId={contextId}
                text={'Add'}
                actorGroupId={'12'}
                existingAspectNames={entities.existingAspectNames}
              />
            )
          }
        >
          {aspects?.map((props, i) => (
            <AspectCard key={i} opportunityId={id} contextId={contextId} isAdmin={options.editAspect} {...props} />
          ))}
        </CardContainer>
      )}
      <ActorGroupCreateModal
        onHide={actions.onAddActorGroupClose}
        show={state.showActorGroupModal}
        opportunityId={id}
        ecosystemModelId={ecosystemModelId}
        availableActorGroupNames={entities.availableActorGroupNames}
      />
    </ContextLayout>
  );
};
export default OpportunityContextView;
