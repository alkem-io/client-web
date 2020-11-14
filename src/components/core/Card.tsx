import clsx from 'clsx';
import React, { FC, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Breakpoints, Theme } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';
import { agnosticFunctor } from '../../utils/functor';
import Button from './Button';
import Tag, { TagProps } from './Tag';
import Typography from './Typography';

interface HeaderProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
  classes?: unknown;
  color?: 'positive' | 'neutralMedium' | 'primary' | 'neutral' | 'negative';
}

const useHeaderStyles = createStyles(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.neutralMedium,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    minHeight: '58px',
    padding: props =>
      agnosticFunctor(props.color)(theme, {}) ||
      `${theme.shape.spacing(2)}px ${theme.shape.spacing(6)}px ${theme.shape.spacing(2)}px ${theme.shape.spacing(4)}px`,

    '& span': {
      [theme.media.down('lg')]: {
        minHeight: 0,
      },
    },
  },
}));

export const HeaderCaption: FC<HeaderProps> = ({ text, className, classes }) => {
  const styles = useHeaderStyles(classes || {});

  return (
    <Typography as="div" variant="caption" color="background" weight="bold" className={clsx(styles.header, className)}>
      <span>{text}</span>
    </Typography>
  );
};

const usePrimaryTextStyles = createStyles(theme => ({
  text: {
    display: 'flex',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    textTransform: 'uppercase',
    lineHeight: props => agnosticFunctor(props.lineHeight)(theme, {}),
  },
  wrapper: {
    color: props => agnosticFunctor(props.color)(theme, {}) || theme.palette.neutral,
  },
}));

export const PrimaryText: FC<HeaderProps> = ({ text, className, classes }) => {
  const styles = usePrimaryTextStyles(classes || {});

  return (
    <div className={styles.wrapper}>
      <Typography as="h4" variant="h4" weight="bold" color="inherit" className={clsx(styles.text, className)} clamp={2}>
        {text}
      </Typography>
    </div>
  );
};

const useTagStyles = createStyles(theme => ({
  tag: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    background: props => agnosticFunctor(props.background)(theme, {}) || theme.palette.positive,
  },
}));

interface CardTagProps extends HeaderProps, TagProps {}

export const CardTag: FC<CardTagProps> = ({ text, className, color, ...rest }) => {
  const styles = useTagStyles({ background: color });

  return <Tag className={clsx(styles.tag, className)} color={color} text={text} {...rest} />;
};

const useMatchedTermsStyles = createStyles(theme => ({
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    maxHeight: `${theme.shape.spacing(9)}px`,
    overflow: 'hidden',
  },
  tag: {
    padding: '5px 10px',
    width: 'fit-content',
    borderRadius: 15,
    textTransform: 'uppercase',
    backgroundColor: theme.palette.primary,
    marginRight: `${theme.shape.spacing(1)}px`,
    marginBottom: `${theme.shape.spacing(1)}px`,
  },
}));

interface MatchedTermsProps {
  terms?: Array<string>;
}

export const MatchedTerms: FC<MatchedTermsProps> = ({ terms }) => {
  const styles = useMatchedTermsStyles();

  return (
    <div className={styles.tagsContainer}>
      {terms && terms.length > 0 && (
        <>
          <Typography as={'span'} className={'mr-2'}>
            Mathed terms:{' '}
          </Typography>
          {terms?.map((t, index) => (
            <Typography key={index} className={styles.tag} color={'background'}>
              {t}
            </Typography>
          ))}
        </>
      )}
    </div>
  );
};

const useBodyStyles = createStyles(theme => ({
  content: {
    display: 'flex',
    position: 'relative',
    width: '100%',
    flexGrow: 1,
    flexDirection: 'column',
    background: (props: ClassProps) => agnosticFunctor(props.background)(theme, {}) || theme.palette.neutralLight,
    padding: (props: ClassProps) => agnosticFunctor(props.padding)(theme, {}) || theme.shape.spacing(4),

    [theme.media.down('md')]: {
      background: (props: ClassProps) =>
        agnosticFunctor(props.background)(theme, { md: true }) || theme.palette.neutralLight,
      padding: (props: ClassProps) => agnosticFunctor(props.padding)(theme, { md: true }) || theme.shape.spacing(4),
    },
    [theme.media.down('sm')]: {
      background: (props: ClassProps) =>
        agnosticFunctor(props.background)(theme, { sm: true }) || theme.palette.neutralLight,
      padding: (props: ClassProps) => agnosticFunctor(props.padding)(theme, { sm: true }) || theme.shape.spacing(4),
    },
    [theme.media.down('xs')]: {
      background: (props: ClassProps) =>
        agnosticFunctor(props.background)(theme, { xs: true }) || theme.palette.neutralLight,
      padding: (props: ClassProps) => agnosticFunctor(props.padding)(theme, { xs: true }) || theme.shape.spacing(4),
    },
  },
}));

interface ClassProps {
  background?: string | ((theme: Theme, media: Record<keyof Breakpoints, boolean>) => string | boolean);
  padding?: string | ((theme: Theme, media: Record<keyof Breakpoints, boolean>) => string | boolean);
}

interface BodyProps {
  className?: string;
  classes?: ClassProps;
}

export const Body: FC<BodyProps> = ({ children, className, classes }) => {
  const styles = useBodyStyles(classes);

  return <div className={clsx(styles.content, 'ct-card-body', className)}>{children}</div>;
};

export interface CardProps extends Record<string, unknown> {
  className?: string;
  headerProps?: HeaderProps;
  tagProps?: CardTagProps;
  matchedTerms?: MatchedTermsProps;
  bodyProps?: BodyProps;
  primaryTextProps?: HeaderProps;
  classes?: ClassProps;
  popUp?: JSX.Element;
}

const useCardStyles = createStyles(theme => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    background: (props: ClassProps) => agnosticFunctor(props.background)(theme, {}) || 'none',
  },
  clickable: {
    cursor: 'pointer',
  },
}));

const Card: FC<CardProps> = ({
  className,
  headerProps,
  tagProps,
  matchedTerms,
  bodyProps,
  primaryTextProps,
  classes = {},
  children,
  popUp,
  ...rest
}) => {
  const styles = useCardStyles(classes);

  const [isModalShown, setIsModalShown] = useState<boolean>(false);

  const handleShow = () => popUp && !isModalShown && setIsModalShown(true);
  const handleClose = () => popUp && setIsModalShown(false);

  return (
    <div className={clsx(styles.root, popUp && styles.clickable, className, 'ct-card')} onClick={handleShow} {...rest}>
      {headerProps && <HeaderCaption {...headerProps} />}
      <Body {...bodyProps}>
        {tagProps && <CardTag {...tagProps} />}
        {primaryTextProps && <PrimaryText {...primaryTextProps} />}
        <div className="flex-grow-1" />
        {matchedTerms && (
          <>
            <MatchedTerms {...matchedTerms} />
            <div className="flex-grow-1" />
          </>
        )}
        {children}
      </Body>
      {popUp && (
        <Modal show={isModalShown} onHide={handleClose} size="lg" centered>
          {popUp}
          <Modal.Footer>
            <Button onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Card;
