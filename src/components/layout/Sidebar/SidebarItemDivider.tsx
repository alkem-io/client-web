import { createStyles } from '../../../hooks/useTheme';
import React from 'react';

const useStyles = createStyles(theme => ({
  line: {
    width: '100%',
    border: 'none',
    height: 1,
    margin: 0,
    flexShrink: 0,
    backgroundColor: theme.palette.neutralMedium,
    marginTop: theme.shape.spacing(1),
    marginBottom: theme.shape.spacing(1),
  },
}));

const SidebarItemDivider = () => {
  const styles = useStyles();
  return <hr id="sidebarItemDivider" className={styles.line} />;
};
export default SidebarItemDivider;
