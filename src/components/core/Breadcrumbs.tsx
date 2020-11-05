import React, { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Path } from '../../context/NavigationProvider';
import { createStyles } from '../../hooks/useTheme';
import Typography from './Typography';

const useBreadcrumbStyles = createStyles(theme => ({
  item: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  spacer: {
    paddingLeft: theme.shape.spacing(1),
    paddingRight: theme.shape.spacing(1),
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
