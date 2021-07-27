import React from 'react';
import { createStyles } from '../../hooks/useTheme';

const useIconStyles = createStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    margin: -theme.shape.spacing(0.5),
    paddingTop: theme.shape.spacing(1),
    paddingBottom: theme.shape.spacing(1),
    '& > *': {
      margin: theme.shape.spacing(0.5),
    },
  },
}));

export interface TagContainerProps {}

const TagContainer: React.FC<TagContainerProps> = ({ children }): JSX.Element | null => {
  const styles = useIconStyles();

  return <div className={styles.root}>{children}</div>;
};

export default TagContainer;
