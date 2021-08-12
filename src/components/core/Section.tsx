import clsx from 'clsx';
import React, { FC } from 'react';
import Grid, { GridSize } from '@material-ui/core/Grid';
import { Theme } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';
import { Breakpoints } from '@material-ui/core/styles/createBreakpoints';
import { createStyles } from '../../hooks/useTheme';
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
}

const useHeaderStyles = createStyles<Theme, ClassProps>(theme => ({
  container: {
    display: 'flex',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${theme.spacing(2)}px`,
    alignItems: 'center',
    color: props => `${agnosticFunctor(props.color)(theme, {}) || theme.palette.neutral.main} !important`,
  },
  tagOffset: {
    marginLeft: theme.spacing(2),
  },
}));

export const Header: FC<HeaderProps> = ({ text, svg, icon, tagText, className, classes = {}, children }) => {
  const styles = useHeaderStyles(classes);

  return (
    <Typography as="h2" variant="h2" color="inherit" weight="bold" className={clsx(styles.header, className)}>
      {text || svg}
      {tagText && <Tag className={styles.tagOffset} text={tagText} />}
      {icon && (
        <>
          <div className={'flex-grow-1'} />
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
  );
};

const useSubHeaderStyles = createStyles(theme => ({
  header: {
    color: (props: ClassProps) =>
      `${agnosticFunctor(props.color)(theme, {}) || theme.palette.neutralMedium.main} !important`,
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

const useBodyStyles = createStyles(() => ({
  bodyWrap: {},
}));

export const Body: FC<HeaderProps> = ({ text, svg, children, className, classes }) => {
  const styles = useBodyStyles(classes);

  return (
    <div className={clsx(styles.bodyWrap, className)}>
      {(text || svg) && (
        <Typography as="p" variant="body" color="neutral" weight="medium">
          {text || svg}
        </Typography>
      )}
      {children}
    </div>
  );
};

const useContentStyles = createStyles(theme => ({
  gutters: {
    padding: theme.spacing(4),
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),

    [theme.breakpoints.down('md')]: {
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

const useSectionStyles = createStyles(theme => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    background: (props: SectionClassProps) =>
      agnosticFunctor(props.background)(theme, {}) || theme.palette.background.paper,
    position: 'relative',
  },
  avatar: {
    display: 'flex',
    flexDirection: 'row-reverse',
    overflow: 'hidden',
    justifyContent: 'center',

    '& > *': {
      display: 'flex',
    },

    '&.mini': {
      width: 100,
    },
  },
  gutter: {
    paddingTop: theme.spacing(4),
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
    <Container maxWidth="xl" disableGutters={!gutters.root} className={clsx(styles.root, className)}>
      <Grid container spacing={2}>
        {!hideAvatar && (
          <Grid item md={12} lg={3}>
            <div className={clsx(styles.avatar, gutters.avatar && styles.gutter)}>{avatar}</div>
          </Grid>
        )}
        <Grid
          item
          className={'d-flex flex-column position-relative'}
          xs={12}
          md={(8 + (hideDetails || !details ? 4 : 0)) as GridSize}
          lg={(6 + (hideAvatar ? 3 : 0) + (hideDetails ? 3 : 0)) as GridSize}
        >
          <Content gutters={gutters.content}>{children}</Content>
        </Grid>
        {!hideDetails && details && (
          <Grid item xs={12} md={4} lg={3}>
            <div className={clsx(gutters.details && styles.gutter)}>{details}</div>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Section;
