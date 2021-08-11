import React, { FC } from 'react';
import Grid, { GridSize } from '@material-ui/core/Grid';
import { Theme } from '@material-ui/core';
import { Container, ContainerProps } from '@material-ui/core';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

interface CardContainerProps extends ContainerProps {
  cardHeight?: number;
  fullHeight?: boolean;
  children: React.ReactNode[];
  title?: string;
  withCreate?: React.ReactNode;
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
}
const defaultProps: Partial<CardContainerProps> = {
  cardHeight: 470,
  xl: 3,
  lg: 4,
  md: 6,
  sm: 12,
  xs: 12,
};

interface ClassProps {
  cardHeight?: number;
  fullHeight?: boolean;
}

const useCardContainerStyles = createStyles<Theme, ClassProps>(theme => ({
  root: {
    '& .ct-card': {
      height: (props: CardContainerProps) => {
        if (props.fullHeight) return '100%';
        return props.cardHeight ? `${props.cardHeight}px` : `calc(100% - ${theme.spacing(1.5)}px)`;
      },
    },
  },
  spacer: {
    height: theme.spacing(1.5),
    width: '100%',
  },
  title: {
    textTransform: 'uppercase',
  },
}));

const CardContainer: FC<CardContainerProps> = ({ children, fullHeight, cardHeight, title, withCreate, ...rest }) => {
  const styles = useCardContainerStyles({ cardHeight, fullHeight });

  return (
    <Container maxWidth="xl" className={styles.root}>
      <Grid container spacing={2}>
        {title && (
          <Grid item xs={12} className={'mb-4'}>
            <Typography variant="h4" color="neutral" weight="bold" className={styles.title}>
              {title}
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Grid container className={'mb-4'} spacing={2}>
            {children.map((c, i) => (
              <Grid item key={i} {...rest}>
                {c}
                <div className={styles.spacer} />
              </Grid>
            ))}
            {withCreate && (
              <Grid item {...rest}>
                {withCreate}
                <div className={styles.spacer} />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
CardContainer.defaultProps = defaultProps;

export { CardContainer };
