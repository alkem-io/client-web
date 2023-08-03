import { Box } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import WrapperButton from '../../../core/WrapperButton';
import Card from '../../../core/Card';
import WrapperTypography from '../../../core/WrapperTypography';

const useCardStyles = makeStyles(theme => ({
  item: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: theme.spacing(2),
  },
  description: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,

    '& > span': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxHeight: '6em',
    },
  },
  card: {
    marginTop: 0,
    border: `1px solid ${theme.palette.neutralMedium.main}`,
    height: 400,
  },
  body: {
    height: 150,
  },
  content: {
    height: '225px',
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  footer: {
    background: theme.palette.neutralLight.main,
    padding: theme.spacing(2),
  },
  tagline: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,
  },
}));

interface ProjectCardProps extends Record<string, unknown> {
  caption?: string;
  title: string;
  description?: string;
  tag?: {
    status: string;
    text: string;
  };
  blank?: boolean;
  onSelect?: () => void;
  children?: React.ReactNode;
}

export const ProjectCard: FC<ProjectCardProps> = ({
  caption,
  title,
  tag,
  description,
  blank = false,
  children,
  onSelect,
  ...rest
}) => {
  const { t } = useTranslation();
  const styles = useCardStyles();
  const headerProps = caption ? { text: caption } : undefined;

  return (
    <Card
      bodyProps={{
        classes: {
          background: theme => theme.palette.neutralLight.main,
        },
      }}
      headerProps={headerProps}
      primaryTextProps={{
        text: title,
        classes: {
          lineHeight: '36px',
        },
      }}
      {...rest}
    >
      {!blank && (
        <>
          {tag && (
            <WrapperTypography
              color={tag.status === 'positive' ? 'positive' : 'negative'}
              variant="caption"
              className={styles.description}
            >
              <span>{tag.text}</span>
            </WrapperTypography>
          )}
          <Box display={'flex'} flexDirection={'column'} flexGrow={1}>
            <WrapperTypography as={'p'} clamp={3}>
              {description}
            </WrapperTypography>

            <Box flexGrow={1} />
            <div>
              <WrapperButton text={t('buttons.details')} onClick={onSelect} />
            </div>
          </Box>
        </>
      )}
      {blank && <>{children}</>}
    </Card>
  );
};
