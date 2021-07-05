import clsx from 'clsx';
import React, { FC, Fragment } from 'react';
import { Col, Container as BootstrapContainer, ContainerProps as BootstrapContainerProps, Row } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useContainerStyles = createStyles(() => ({
  noGutters: {
    padding: 0,
    margin: 0,
  },
}));

interface ContainerProps extends BootstrapContainerProps {
  classes?: unknown;
  disableGutters?: boolean;
}

const Container: FC<ContainerProps> = ({ children, fluid = true, className, classes, disableGutters, ...rest }) => {
  const styles = useContainerStyles(classes);

  return (
    <BootstrapContainer className={clsx(disableGutters && styles.noGutters, className)} fluid={fluid} {...rest}>
      {children}
    </BootstrapContainer>
  );
};

export default Container;

interface CardContainerProps extends ContainerProps {
  cardHeight?: unknown;
  fullHeight?: boolean;
  children: React.ReactNode[];
  title?: string;
  withCreate?: React.ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}
const defaultProps: Partial<CardContainerProps> = {
  cardHeight: 470,
  xl: 3,
  lg: 4,
  md: 6,
  sm: 12,
  xs: 12,
};

const useCardContainerStyles = createStyles(theme => ({
  root: {
    '& .ct-card': {
      height: props => {
        if (props.fullHeight) return '100%';
        return props.cardHeight ? `${props.cardHeight}px` : `calc(100% - ${theme.shape.spacing(1.5)}px)`;
      },
    },
  },
  spacer: {
    height: theme.shape.spacing(1.5),
    width: '100%',
  },
  title: {
    textTransform: 'uppercase',
  },
}));

const CardContainer: FC<CardContainerProps> = ({ children, fullHeight, cardHeight, title, withCreate, ...rest }) => {
  const styles = useCardContainerStyles({ cardHeight, fullHeight });

  return (
    <Container className={styles.root}>
      {title && (
        <Row className={'mb-4'}>
          <Col xs={12}>
            <Typography variant="h4" color="neutral" weight="bold" className={styles.title}>
              {title}
            </Typography>
          </Col>
        </Row>
      )}
      <Row className={'mb-4'}>
        {children.map((c, i) => (
          <Fragment key={i}>
            <Col {...rest}>
              {c}
              <div className={styles.spacer} />
            </Col>
          </Fragment>
        ))}
        {withCreate && (
          <Col {...rest}>
            {withCreate}
            <div className={styles.spacer} />
          </Col>
        )}
      </Row>
    </Container>
  );
};
CardContainer.defaultProps = defaultProps;

export { CardContainer };
