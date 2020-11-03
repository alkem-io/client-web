import React, { FC } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';
import Hidden from './Hidden';
import Tag from './Tag';

const useSectionStyles = createStyles(theme => ({
  toolbar: {
    height: theme.shape.spacing(4),
    display: 'flex',
    flexDirection: 'row',
  },
  avatar: {
    display: 'flex',
    flexDirection: 'row-reverse',

    '& > *': {
      display: 'flex',
    },
  },
}));

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

export const Body: FC<HeaderProps> = ({ text, svg, children }) => {
  return (
    <div>
      <Typography as="p" variant="body" color="neutral" weight="medium">
        {text || svg}
      </Typography>
      {children}
    </div>
  );
};

const useContentStyles = createStyles(theme => ({
  content: {
    paddingTop: theme.shape.spacing(8),
    paddingBottom: theme.shape.spacing(8),
    paddingLeft: theme.shape.spacing(2),
    paddingRight: theme.shape.spacing(2),
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
    <Container fluid className={className}>
      <Row>
        {!hideAvatar && (
          <Col xs={false} md={3}>
            <Hidden mdDown>
              <Content>
                <div className={styles.avatar}>{avatar}</div>
              </Content>
            </Hidden>
          </Col>
        )}
        <Col xs={12} md={6 + (hideAvatar ? 3 : 0) + (hideDetails ? 3 : 0)}>
          <Content>{children}</Content>
        </Col>
        {!hideDetails && details && (
          <Col xs={12} md={3}>
            <Content>{details}</Content>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Section;
