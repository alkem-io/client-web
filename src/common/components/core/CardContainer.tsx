import React, { FC } from 'react';
import Grid, { GridSize } from '@mui/material/Grid';
import { Box, Theme } from '@mui/material';
import { Container, ContainerProps } from '@mui/material';
import { makeStyles } from '@mui/styles';
import WrapperTypography from './WrapperTypography';

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

const useCardContainerStyles = makeStyles<Theme, ClassProps>(theme => ({
  root: {
    '& .alkemio-card': {
      height: (props: CardContainerProps) => {
        if (props.fullHeight) return '100%';
        return props.cardHeight ? `${props.cardHeight}px` : `calc(100% - ${theme.spacing(1.5)})`;
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

const CardContainer: FC<CardContainerProps> = ({
  children,
  fullHeight,
  cardHeight,
  title,
  withCreate,
  xl,
  lg,
  md,
  sm,
  xs,
}) => {
  const styles = useCardContainerStyles({ cardHeight, fullHeight });

  return (
    <Container maxWidth="xl" className={styles.root}>
      <Grid container spacing={2}>
        {title && (
          <Grid component={Box} item xs={12} marginBottom={4}>
            <WrapperTypography variant="h4" color="neutral" weight="bold" className={styles.title}>
              {title}
            </WrapperTypography>
          </Grid>
        )}
        <Grid item xs={12}>
          <Grid component={Box} container spacing={2} marginBottom={4}>
            {children.map((c, i) => (
              <Grid item key={i} xl={xl} lg={lg} md={md} sm={sm} xs={xs}>
                {c}
                <div className={styles.spacer} />
              </Grid>
            ))}
            {withCreate && (
              <Grid item xl={xl} lg={lg} md={md} sm={sm} xs={xs}>
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
