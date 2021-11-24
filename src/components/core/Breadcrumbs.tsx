import React, { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Path } from '../../context/NavigationProvider';
import { makeStyles } from '@mui/styles';
import Typography from './Typography';

const useBreadcrumbStyles = makeStyles(theme => ({
  item: {
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
    textDecoration: 'none',
  },
  spacer: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

interface BreadcrumbProps {
  className?: string;
  classes?: unknown;
  paths: Path[];
}

const Breadcrumbs: FC<BreadcrumbProps> = ({ paths, classes, className }) => {
  const styles = useBreadcrumbStyles(classes);

  return (
    <div className={className}>
      {paths.map((p, i) => {
        return (
          <Fragment key={i}>
            <Typography
              as={p.real ? Link : 'span'}
              to={p.value}
              variant="button"
              color={i === paths.length - 1 ? 'neutral' : 'neutralMedium'}
              className={styles.item}
              weight="bold"
            >
              {`${p.name}`}
            </Typography>
            {i !== paths.length - 1 && (
              <Typography as={'span'} className={styles.spacer} color="neutralMedium" weight="bold">
                /
              </Typography>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
