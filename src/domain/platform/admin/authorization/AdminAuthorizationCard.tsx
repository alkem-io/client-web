import clsx from 'clsx';
import React, { FC } from 'react';
import { Breakpoint, Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { functor } from '../../../../core/utils/functor';
import Tag, { TagProps } from '../../../../core/ui/tags/deprecated/Tag';
import WrapperTypography from '../../../../core/ui/typography/deprecated/WrapperTypography';
import hexToRGBA from '../../../../core/utils/hexToRGBA';
import Tooltip from '@mui/material/Tooltip';

interface HeaderProps {
  text: string | React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  classes?: ClassProps;
  color?: 'positive' | 'neutralMedium' | 'primary' | 'neutral' | 'negative' | 'background';
  tooltip?: boolean;
}

const useHeaderStyles = makeStyles<Theme, ClassProps>(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.neutralMedium.main,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    minHeight: '58px',
    padding: props =>
      functor(props.color)(theme, {}) ||
      `${theme.spacing(2)} ${theme.spacing(6)} ${theme.spacing(2)} ${theme.spacing(4)}`,

    '& span': {
      [theme.breakpoints.down('xl')]: {
        minHeight: 0,
      },
    },
  },
}));

export const HeaderCaption: FC<HeaderProps> = ({ text, className, classes }) => {
  const styles = useHeaderStyles(classes || {});

  return (
    <WrapperTypography
      as="div"
      variant="caption"
      color="background"
      weight="bold"
      className={clsx(styles.header, className)}
    >
      <span>{text}</span>
    </WrapperTypography>
  );
};

const usePrimaryTextStyles = makeStyles<Theme, ClassProps>(theme => ({
  primaryText: {
    display: 'flex',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    textTransform: 'uppercase',
    lineHeight: props => functor(props.lineHeight)(theme, {}),
  },
  primaryTextWrapper: {
    color: props => functor(props.color)(theme, {}) || theme.palette.neutral.main,
    display: 'flex',
    flexBasis: '60px',
  },
}));

export const PrimaryText: FC<HeaderProps> = ({ text, tooltip, className, classes }) => {
  const styles = usePrimaryTextStyles(classes || {});

  if (tooltip) {
    return (
      <Tooltip placement="right" id={`challenge-${text}-tooltip`} title={text || ''} arrow>
        <div className={styles.primaryTextWrapper}>
          <WrapperTypography
            as="h4"
            variant="h4"
            weight="bold"
            color="inherit"
            className={clsx(styles.primaryText, className)}
            clamp={2}
          >
            {text}
          </WrapperTypography>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className={styles.primaryTextWrapper}>
      <WrapperTypography
        as="h4"
        variant="h4"
        weight="bold"
        color="inherit"
        className={clsx(styles.primaryText, className)}
        clamp={2}
      >
        {text}
      </WrapperTypography>
    </div>
  );
};

const useActionsStyle = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    gap: 10,
    top: 0,
    right: 5,
  },
  action: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

interface CardActionsProps {
  actions: JSX.Element[];
}

export const CardActions: FC<CardActionsProps> = ({ actions }) => {
  const styles = useActionsStyle();

  return (
    <div className={styles.container}>
      {actions.map((a, index) => (
        <span key={index} className={styles.action}>
          {a}
        </span>
      ))}
    </div>
  );
};

const useTagStyles = makeStyles<Theme, ClassProps>(theme => ({
  tag: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: props => (props.actions ? functor(props.actions)(theme, {}) * 25 + 15 : 0),
    background: props => functor(props.background)(theme, {}) || theme.palette.positive.main,
  },
}));

interface CardTagProps extends HeaderProps, TagProps {}

export const CardTag: FC<CardTagProps> = ({ text, className, color, actions = 0, ...rest }) => {
  const styles = useTagStyles({ background: color, actions });

  return <Tag className={clsx(styles.tag, className)} color={color} text={text} {...rest} />;
};

const useMatchedTermsStyles = makeStyles(theme => ({
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    maxHeight: theme.spacing(9),
    overflow: 'hidden',
  },
  title: {
    marginTop: 5,
    marginRight: 20,
  },
  tag: {
    padding: '5px 10px',
    width: 'fit-content',
    borderRadius: 15,
    textTransform: 'uppercase',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  primary: {
    backgroundColor: theme.palette.primary.main,
  },
  light: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

interface MatchedTermsProps {
  terms?: Array<string>;
  variant?: 'primary' | 'light';
}

export const MatchedTerms: FC<MatchedTermsProps> = ({ terms, variant = 'primary' }) => {
  const styles = useMatchedTermsStyles();

  return (
    <div className={styles.tagsContainer}>
      {terms && terms.length > 0 && (
        <>
          <WrapperTypography
            as={'span'}
            color={variant === 'light' ? 'background' : 'primary'}
            className={styles.title}
          >
            Matched terms:{' '}
          </WrapperTypography>
          {terms?.map((t, index) => (
            <WrapperTypography
              key={index}
              className={clsx(styles.tag, styles[variant])}
              color={variant === 'light' ? 'primary' : 'background'}
            >
              {t}
            </WrapperTypography>
          ))}
        </>
      )}
    </div>
  );
};

const useBodyStyles = makeStyles<Theme, ClassProps>(theme => ({
  body: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    flexGrow: 1,
    background: props => functor(props.background)(theme, {}) || theme.palette.neutralLight.main,
    padding: props =>
      functor(props.padding)(theme, {}) || `${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(1)}`,

    [theme.breakpoints.down('xl')]: {
      background: props => functor(props.background)(theme, { md: true }) || theme.palette.neutralLight.main,
      padding: props => functor(props.padding)(theme, { md: true }) || theme.spacing(3),
    },
    [theme.breakpoints.down('lg')]: {
      background: props => functor(props.background)(theme, { sm: true }) || theme.palette.neutralLight.main,
      padding: props => functor(props.padding)(theme, { sm: true }) || theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      background: props => functor(props.background)(theme, { xs: true }) || theme.palette.neutralLight.main,
      padding: props => functor(props.padding)(theme, { xs: true }) || theme.spacing(3),
    },
  },
}));

export interface ClassProps {
  background?: string | ((theme: Theme, media: Partial<Record<Breakpoint, boolean>>) => string);
  padding?: string | ((theme: Theme, media: Partial<Record<Breakpoint, boolean>>) => string);
  color?: string | ((theme: Theme, media: Partial<Record<Breakpoint, boolean>>) => string);
  lineHeight?: string | ((theme: Theme, media: Partial<Record<Breakpoint, boolean>>) => string);
  actions?: number | ((theme: Theme, media: Partial<Record<Breakpoint, boolean>>) => number);
}

interface BodyProps {
  className?: string;
  classes?: ClassProps;
}

export const Body: FC<BodyProps> = ({ children, className, classes = {} }) => {
  const styles = useBodyStyles(classes);

  return <div className={clsx(styles.body, 'alkemio-card-body', className)}>{children}</div>;
};

interface SectionProps {
  className?: string;
  classes?: ClassProps;
  children?: React.ReactNode;
}

export const Section: FC<SectionProps> = ({ children, className }) => {
  return <div className={clsx('alkemio-card-section', className)}>{children}</div>;
};

interface FooterProps {
  className?: string;
  classes?: ClassProps;
  children?: React.ReactNode;
}

export const Footer: FC<FooterProps> = ({ children, className }) => {
  return <div className={clsx('alkemio-card-footer', className)}>{children}</div>;
};

export interface CardProps extends Record<string, unknown> {
  className?: string;
  cardClassName?: string;
  headerProps?: HeaderProps;
  tagProps?: CardTagProps;
  matchedTerms?: MatchedTermsProps;
  bodyProps?: BodyProps;
  sectionProps?: SectionProps;
  footerProps?: FooterProps;
  primaryTextProps?: HeaderProps;
  classes?: ClassProps;
  bgText?: {
    text: string;
  };
  level?: {
    level: string;
    name: string;
  };
  actions?: JSX.Element[];
  onClick?: () => void;
}

const useCardStyles = makeStyles<Theme, ClassProps>(theme => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    background: props => functor(props.background)(theme, {}) || 'none',
  },
  clickable: {
    cursor: 'pointer',
  },
  cardBgText: {
    fontSize: 56,
    position: 'absolute',
    bottom: 0,
    right: -4,
    color: hexToRGBA(theme.palette.background.paper, 0.3),
    textTransform: 'uppercase',
    letterSpacing: theme.spacing(0.3),
    fontWeight: 800,
    lineHeight: theme.spacing(4),
  },
}));

const AdminAuthorizationCard: FC<CardProps> = ({
  className,
  headerProps,
  tagProps,
  matchedTerms,
  bodyProps,
  sectionProps,
  footerProps,
  primaryTextProps,
  classes = {},
  children,
  bgText,
  level,
  actions,
  onClick,
  ...rest
}) => {
  const styles = useCardStyles(classes);

  //TODO this should not be here...
  const isSpaceLevel = level?.level === 'Space';

  return (
    <div
      className={clsx(styles.root, onClick && styles.clickable, className, 'alkemio-card')}
      onClick={onClick}
      {...rest}
    >
      {headerProps && <HeaderCaption {...headerProps} />}

      <Body {...bodyProps}>
        {actions && actions?.length > 0 && <CardActions actions={actions} />}
        {tagProps && <CardTag actions={actions?.length} {...tagProps} />}

        {primaryTextProps && <PrimaryText {...primaryTextProps} />}
        {level && (
          <WrapperTypography color={'background'}>
            {!isSpaceLevel && `${level.level}: `}
            {`${level.name} `}
          </WrapperTypography>
        )}

        {matchedTerms && (
          <>
            <MatchedTerms {...matchedTerms} />
          </>
        )}
        {bgText && <span className={styles.cardBgText}>{bgText.text}</span>}
        {children}
      </Body>
      {sectionProps && sectionProps?.children && <Section {...sectionProps} />}
      {footerProps && footerProps?.children && <Footer {...footerProps} />}
    </div>
  );
};

export default AdminAuthorizationCard;
