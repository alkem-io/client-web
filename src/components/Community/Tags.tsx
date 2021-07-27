import React, { FC } from 'react';
import Typography from '../core/Typography';
import { createStyles } from '../../hooks';

const useUserPopUpStyles = createStyles(theme => ({
  terms: {
    display: 'flex',
    gap: `${theme.shape.spacing(1)}px`,
  },
  term: {
    padding: '5px 10px',
    borderRadius: `${theme.shape.spacing(2)}px`,
    backgroundColor: theme.palette.primary,
    textTransform: 'capitalize',
  },
}));

const Tags: FC<{ tags: Array<string> }> = ({ tags }) => {
  const styles = useUserPopUpStyles();

  return (
    <div className={styles.terms}>
      {tags?.map((t, index) => (
        <Typography key={index} className={styles.term} color={'background'}>
          {t}
        </Typography>
      ))}
    </div>
  );
};

export default Tags;
