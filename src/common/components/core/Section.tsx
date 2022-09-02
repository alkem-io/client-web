import { Box, Container } from '@mui/material';
import Grid, { GridSize } from '@mui/material/Grid';
import { Breakpoints, Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import React, { FC } from 'react';
import { agnosticFunctor } from '../../utils/functor';
import Tag from './Tag';
import Typography from './Typography';

interface HeaderProps {
  text?: string;
  svg?: React.ReactNode;
  icon?: React.ReactNode;
  tagText?: string;
  className?: string;
  classes?: ClassProps;
  editComponent?: React.ReactNode;
}

const useHeaderStyles = makeStyles<Theme, ClassProps>(theme => ({
  container: {
    display: 'flex',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    alignItems: 'center',
    color: props => `${agnosticFunctor(props.color)(theme, {}) || theme.palette.neutral.main} !important`,
  },
  tagOffset: {
    marginLeft: theme.spacing(2),
  },
}));

export const Header: FC<HeaderProps> = ({
  text,
  svg,
  icon,
  tagText,
  className,
  classes = {},
  editComponent,
  children,
}) => {
  const styles = useHeaderStyles(classes);

  return (
    <Grid container>
      <Grid item xs={editComponent ? 11 : 12}>
        <Typography as="h2" variant="h2" color="inherit" weight="bold" className={clsx(styles.header, className)}>
          {text || svg}
          {tagText && <Tag className={styles.tagOffset} text={tagText} />}
          {icon && (
            <>
              <Box flexGrow={1} />
              {icon}
            </>
          )}
          {children && (
            <Grid container spacing={2}>
              <Grid item lg={4} md={6} xs={12}>
                {children}
              </Grid>
            </Grid>
          )}
        </Typography>
      </Grid>
      {editComponent && (
        <Grid item xs={1}>
          {editComponent}
        </Grid>
      )}
    </Grid>
  );
};

const useSubHeaderStyles = makeStyles<Theme, ClassProps>(theme => ({
  header: {
    color: props => `${agnosticFunctor(props.color)(theme, {}) || theme.palette.neutralMedium.main} !important`,
  },
}));

export const SubHeader: FC<HeaderProps> = ({ text, svg, className, children, classes = {} }) => {
  const styles = useSubHeaderStyles(classes);

  return (
    <>
      {(text || svg) && (
        <Typography as="h3" variant="h3" color="inherit" weight="regular" className={clsx(styles.header, className)}>
          {text || svg}
        </Typography>
      )}
      {children}
    </>
  );
};

const useBodyStyles = makeStyles(() => ({
  bodyWrap: {},
}));

export const Body: FC<HeaderProps> = ({ text, svg, children, className, classes }) => {
  const styles = useBodyStyles(classes);

  return (
    <div className={clsx(styles.bodyWrap, className)}>
      {(text || svg) && (
        <Typography as="p" variant="body1" color="neutral" weight="medium">
          {text || svg}
        </Typography>
      )}
      {children}
    </div>
  );
};

const useContentStyles = makeStyles(theme => ({
  gutters: {
    padding: theme.spacing(4),
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),

    [theme.breakpoints.down('xl')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
}));

const Content: FC<{ gutters?: boolean; classes?: ClassProps }> = ({ children, classes, gutters = true }) => {
  const styles = useContentStyles(classes || {});

  return <div className={clsx(gutters && styles.gutters, styles.content)}>{children}</div>;
};

interface ClassProps {
  background?: string | ((theme: Theme, media: Record<keyof Breakpoints, boolean>) => string | boolean);
  padding?: string | ((theme: Theme, media: Record<keyof Breakpoints, boolean>) => string | boolean);
  color?: string | ((theme: Theme, media: Record<keyof Breakpoints, boolean>) => string | boolean);
}

interface SectionProps {
  className?: string;
  avatar?: React.ReactNode;
  details?: React.ReactNode;
  hideAvatar?: boolean;
  hideDetails?: boolean;
  gutters?: {
    root?: boolean;
    content?: boolean;
    details?: boolean;
    avatar?: boolean;
  };
  classes?: SectionClassProps;
}

interface SectionClassProps extends ClassProps {
  coverBackground?: string | ((theme: Theme, media: Record<keyof Breakpoints, boolean>) => string | boolean);
}

const useSectionStyles = makeStyles<Theme, SectionClassProps>(theme => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    background: (props: SectionClassProps) =>
      agnosticFunctor(props.background)(theme, {}) || theme.palette.background.default,
    position: 'relative',
  },
  avatar: {
    display: 'flex',
    flexDirection: 'row-reverse',
    overflow: 'hidden',
    justifyContent: 'center',

    '&.mini': {
      width: 100,
    },
  },
  gutter: {
    paddingTop: theme.spacing(4),
  },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    background: props => agnosticFunctor(props.coverBackground)(theme, {}) || 'transparent',
  },
  content: {
    zIndex: 1,
  },
}));

const Section: FC<SectionProps> = ({
  className,
  classes = {},
  children,
  avatar,
  details,
  hideAvatar = false,
  hideDetails = false,
  gutters = {
    root: true,
    content: true,
    details: true,
    avatar: true,
  },
}) => {
  const styles = useSectionStyles(classes);

  return (
    <Container maxWidth="xl" className={clsx(styles.root, className)}>
      <div className={styles.cover} />
      <Grid container spacing={2}>
        {!hideAvatar && (
          <Grid item md={12} lg={3} className={styles.content}>
            <div className={clsx(styles.avatar, gutters.avatar && styles.gutter)}>{avatar}</div>
          </Grid>
        )}
        <Grid
          item
          container
          direction={'column'}
          className={styles.content}
          xs={12}
          md={(8 + (hideDetails || !details ? 4 : 0)) as GridSize}
          lg={(6 + (hideAvatar ? 3 : 0) + (hideDetails ? 3 : 0)) as GridSize}
        >
          <Content gutters={gutters.content}>{children}</Content>
        </Grid>
        {!hideDetails && details && (
          <Grid item xs={12} md={4} lg={3} className={styles.content}>
            <div className={clsx(gutters.details && styles.gutter)}>{details}</div>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Section;
