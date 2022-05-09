import React from 'react';
import { makeStyles } from '@mui/styles';

const useIconStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    margin: -theme.spacing(0.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));

export interface TagContainerProps {}

const TagContainer: React.FC<TagContainerProps> = ({ children }): JSX.Element | null => {
  const styles = useIconStyles();

  return <div className={styles.root}>{children}</div>;
};

export default TagContainer;
