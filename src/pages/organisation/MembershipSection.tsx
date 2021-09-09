import React, { FC } from 'react';
import { MembershipResultEntry } from '../../models/graphql-schema';
import Section, { Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { CardContainer } from '../../components/core/CardContainer';
import CardProps from './CardProps';
import { Typography } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  noDataText: {
    padding: theme.spacing(2),
  },
}));

type ComponentCard = React.ComponentType<CardProps>;

interface Props {
  entities: MembershipResultEntry[];
  cardHeight?: number;
  cardComponent: ComponentCard;
  title: string;
  subtitle: string;
  noDataText: string;
  icon: React.ReactElement;
}

const MembershipSection: FC<Props> = ({
  entities,
  title,
  subtitle,
  noDataText,
  icon,
  cardHeight,
  cardComponent: CardComponent,
}) => {
  const styles = useStyles();

  return (
    <>
      <Section avatar={icon}>
        <SectionHeader text={title} />
        <SubHeader text={subtitle} />
      </Section>
      {!entities.length && (
        <Typography align={'center'} variant={'subtitle1'} className={styles.noDataText}>
          {noDataText}
        </Typography>
      )}
      <CardContainer cardHeight={cardHeight}>
        {entities.map(({ id, ecoverseID }, i) => (
          <CardComponent key={i} id={id} ecoverseID={ecoverseID} />
        ))}
      </CardContainer>
    </>
  );
};
export default MembershipSection;
