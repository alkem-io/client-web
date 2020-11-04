import React, { FC } from 'react';
import Container from './Container';
import { Col, Row } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';
import Hidden from './Hidden';
import Tag from './Tag';
import clsx from 'clsx';

interface HeaderProps {
  text?: string;
  svg?: React.ReactNode;
  tagText?: string;
}

const useHeaderStyles = createStyles(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  tagOffset: {
    marginLeft: theme.shape.spacing(2),
  },
}));

export const Header: FC<HeaderProps> = ({ text, svg, tagText }) => {
  const styles = useHeaderStyles();

  return (
    <Typography as="h2" variant="h2" color="neutral" weight="bold" className={styles.header}>
      {text || svg}
      {tagText && <Tag className={styles.tagOffset} text={tagText} />}
    </Typography>
  );
};

export const SubHeader: FC<HeaderProps> = ({ text, svg }) => {
  return (
    <Typography as="h3" variant="h3" color="neutralMedium" weight="regular">
      {text || svg}
    </Typography>
  );
};

const useBodyStyles = createStyles(theme => ({
  bodyWrap: {},
}));

export const Body: FC<HeaderProps> = ({ text, svg, children }) => {
  const styles = useBodyStyles();

  return (
    <div className={styles.bodyWrap}>
      <Typography as="p" variant="body" color="neutral" weight="medium">
        {text || svg}
      </Typography>
      {children}
    </div>
  );
};

const useContentStyles = createStyles(theme => ({
  content: {
    padding: theme.shape.spacing(4),

    [theme.media.down('md')]: {
      paddingLeft: theme.shape.spacing(2),
      paddingRight: theme.shape.spacing(2),
    },
  },
}));

const Content: FC = ({ children }) => {
  const styles = useContentStyles();

  return <div className={styles.content}>{children}</div>;
};

interface SectionProps {
  className?: string;
  avatar?: React.ReactNode;
  details?: React.ReactNode;
  hideAvatar?: boolean;
  hideDetails?: boolean;
}

const useSectionStyles = createStyles(theme => ({
  root: {
    paddingTop: theme.shape.spacing(2),
    paddingBottom: theme.shape.spacing(2),
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
  children,
  avatar,
  details,
  hideAvatar = false,
  hideDetails = false,
}) => {
  const styles = useSectionStyles();

  return (
    <Container className={clsx(styles.root, className)}>
      <Row>
        {!hideAvatar && (
          <Col xs={false} lg={3}>
            <Hidden lgDown>
              <div className={styles.avatar}>{avatar}</div>
            </Hidden>
          </Col>
        )}
        <Col xs={12} md={8 + (hideDetails ? 4 : 0)} lg={6 + (hideAvatar ? 3 : 0) + (hideDetails ? 3 : 0)}>
          <Content>{children}</Content>
        </Col>
        {!hideDetails && details && (
          <Col xs={12} md={4} lg={3}>
            <div className={styles.details}>{details}</div>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Section;
