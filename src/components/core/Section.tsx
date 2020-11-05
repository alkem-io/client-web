import React, { FC } from 'react';
import Container from './Container';
import { Col, Row } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';
import Hidden from './Hidden';
import Tag from './Tag';
import clsx from 'clsx';
import { Breakpoints, Theme } from '../../context/ThemeProvider';
import { agnosticFunctor } from '../../utils/functor';

interface HeaderProps {
  text?: string;
  svg?: React.ReactNode;
  tagText?: string;
  className?: string;
  classes?: ClassProps;
}

const useHeaderStyles = createStyles(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    color: (props: ClassProps) => `${agnosticFunctor(props.color)(theme, {}) || theme.palette.neutral} !important`,
  },
  tagOffset: {
    marginLeft: theme.shape.spacing(2),
  },
}));

export const Header: FC<HeaderProps> = ({ text, svg, tagText, className, classes = {} }) => {
  const styles = useHeaderStyles(classes);

  return (
    <Typography as="h2" variant="h2" color="inherit" weight="bold" className={clsx(styles.header, className)}>
      {text || svg}
      {tagText && <Tag className={styles.tagOffset} text={tagText} />}
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
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  gutters: {
    padding: theme.shape.spacing(4),

    [theme.media.down('md')]: {
      paddingLeft: theme.shape.spacing(2),
      paddingRight: theme.shape.spacing(2),
    },
  },
}));

const Content: FC<{ gutters?: boolean; classes?: ClassProps }> = ({ children, classes, gutters = true }) => {
  const styles = useContentStyles(classes || {});

  return <div className={clsx(styles.content, gutters && styles.gutters)}>{children}</div>;
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
  };
  classes?: ClassProps;
}

const useSectionStyles = createStyles(theme => ({
  root: {
    paddingTop: theme.shape.spacing(2),
    paddingBottom: theme.shape.spacing(2),
    background: (props: ClassProps) => agnosticFunctor(props.background)(theme, {}) || theme.palette.background,
  },
  avatar: {
    display: 'flex',
    flexDirection: 'row-reverse',
    paddingTop: theme.shape.spacing(4),

    '& > *': {
      display: 'flex',
    },
  },
  details: {
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
  },
}) => {
  const styles = useSectionStyles(classes);

  return (
    <Container disableGutters={!gutters.root} className={clsx(styles.root, className)}>
      <Row>
        {!hideAvatar && (
          <Col xs={false} lg={3}>
            <Hidden lgDown>
              <div className={styles.avatar}>{avatar}</div>
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
            <div className={clsx(gutters.details && styles.details)}>{details}</div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Section;
