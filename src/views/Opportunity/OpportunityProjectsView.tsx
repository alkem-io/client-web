import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SwitchCardComponent } from '../../components/composite/entities/Hub/Cards';
import { CardContainer } from '../../components/core/CardContainer';
import Icon from '../../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { OpportunityProject } from '../../models/entities/opportunity';
import { ViewProps } from '../../models/view';

export interface OpportunityProjectsViewEntities {
  opportunityProjects: OpportunityProject[];
}

export interface OpportunityProjectsViewActions {}

export interface OpportunityProjectsViewState {}

export interface OpportunityProjectsViewOptions {}

export interface OpportunityProjectsViewProps
  extends ViewProps<
    OpportunityProjectsViewEntities,
    OpportunityProjectsViewActions,
    OpportunityProjectsViewState,
    OpportunityProjectsViewOptions
  > {}

const OpportunityProjectsView: FC<OpportunityProjectsViewProps> = ({ entities }) => {
  const { t } = useTranslation();

  return (
    <>
      <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
        <SectionHeader
          text={t('pages.opportunity.sections.projects.header.text')}
          tagText={t('pages.opportunity.sections.projects.header.tag')}
        />
        <SubHeader text={t('pages.opportunity.sections.projects.subheader')} />
        <Body text={t('pages.opportunity.sections.projects.body')} />
      </Section>
      <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
        {entities.opportunityProjects.map(({ type, ...rest }, i) => {
          const Component = SwitchCardComponent({ type });
          return <Component {...rest} key={i} />;
        })}
      </CardContainer>
    </>
  );
};
export default OpportunityProjectsView;
