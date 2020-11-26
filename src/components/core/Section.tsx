import clsx from 'clsx';
import React, { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Breakpoints, Theme } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';
import { agnosticFunctor } from '../../utils/functor';
import Container from './Container';
import Hidden from './Hidden';
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

const useHeaderStyles = createStyles(theme => ({
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${theme.shape.spacing(2)}px`,
    alignItems: 'center',
    color: (props: ClassProps) => `${agnosticFunctor(props.color)(theme, {}) || theme.palette.neutral} !important`,
  },
  tagOffset: {
    marginLeft: theme.shape.spacing(2),
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
        <Col lg={4} md={6} xs={12}>
          {children}
        </Col>
      )}
    </Typography>
  );
};

const useSubHeaderStyles = createStyles(theme => ({
  header: {
    color: (props: ClassProps) =>
      `${agnosticFunctor(props.color)(theme, {}) || theme.palette.neutralMedium} !important`,
  },
}));

export const SubHeader: FC<HeaderProps> = ({ text, svg, className, classes = {} }) => {
  const styles = useSubHeaderStyles(classes);

  return (
    <Typography as="h3" variant="h3" color="inherit" weight="regular" className={clsx(styles.header, className)}>
      {text || svg}
    </Typography>
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
    padding: theme.shape.spacing(4),
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.shape.spacing(4),
    paddingRight: theme.shape.spacing(4),

    [theme.media.down('md')]: {
      paddingLeft: theme.shape.spacing(2),
      paddingRight: theme.shape.spacing(2),
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
    paddingTop: theme.shape.spacing(2),
    paddingBottom: theme.shape.spacing(2),
    background: (props: SectionClassProps) => agnosticFunctor(props.background)(theme, {}) || theme.palette.background,
    position: 'relative',
  },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: props => agnosticFunctor(props.coverBackground)(theme, {}) || 'transparent',
    zIndex: 0,
  },
  row: {
    zIndex: 1,
  },
  avatar: {
    display: 'flex',
    flexDirection: 'row-reverse',

    '& > *': {
      display: 'flex',
    },
  },
  gutter: {
    paddingTop: theme.shape.spacing(4),
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
    <Container disableGutters={!gutters.root} className={clsx(styles.root, className)}>
      <div className={styles.cover}></div>
      <Row className={styles.row}>
        {!hideAvatar && (
          <Col xs={false} lg={3}>
            <Hidden lgDown>
              <div className={clsx(styles.avatar, gutters.avatar && styles.gutter)}>{avatar}</div>
            </Hidden>
          </Col>
        )}
        <Col
          className={'d-flex flex-column position-relative'}
          xs={12}
          md={8 + (hideDetails ? 4 : 0)}
          lg={6 + (hideAvatar ? 3 : 0) + (hideDetails ? 3 : 0)}
        >
          <Content gutters={gutters.content}>{children}</Content>
        </Col>
        {!hideDetails && details && (
          <Col xs={12} md={4} lg={3}>
            <div className={clsx(gutters.details && styles.gutter)}>{details}</div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Section;
