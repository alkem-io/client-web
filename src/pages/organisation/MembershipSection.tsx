import React, { FC } from 'react';
import { MembershipResultEntry } from '../../models/graphql-schema';
import Section, { Header as SectionHeader } from '../../components/core/Section';
import { CardContainer } from '../../components/core/CardContainer';
import CardProps from './CardProps';

type ComponentCard = React.ComponentType<CardProps>;

interface Props {
  entities: MembershipResultEntry[];
  cardHeight?: number;
  cardComponent: ComponentCard;
  title: string;
  icon: React.ReactElement;
}

const MembershipSection: FC<Props> = ({ entities, title, icon, cardHeight, cardComponent: CardComponent }) => {
  return (
    <>
      <Section avatar={icon}>
        <SectionHeader text={title} />
      </Section>
      <CardContainer cardHeight={cardHeight}>
        {entities.map(({ id, ecoverseID }, i) => (
          <CardComponent key={i} id={id} ecoverseID={ecoverseID} />
        ))}
      </CardContainer>
    </>
  );
};
export default MembershipSection;
