import { Breadcrumbs as MUIBreadcrumbs, Link, styled, Typography } from '@mui/material';
import React, { FC } from 'react';
import { RouterLink } from '../../../../components/core/RouterLink';
import { Path } from '../../../../context/NavigationProvider';
import { useNavigation } from '../../../../hooks';

const Root = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  padding: theme.spacing(1),
  textAlign: 'left',
}));

interface BreadcrumbProps {
  title?: string;
}

const filterPaths = (paths: Path[]) => {
  let filteredPaths = paths.slice(1); // Skip first item, it's always "Home"
  filteredPaths.pop(); // remove the last one. It's always a leaf tab like Dashboard / Context / Community...
  filteredPaths.pop(); // remove the second last one. It is where we are at.
  return filteredPaths;
};

const Breadcrumbs: FC<BreadcrumbProps> = ({ title }) => {
  const { paths } = useNavigation();
  const filteredPaths = filterPaths(paths);

  return (
    <>
      {filteredPaths.length > 0 && (
        <Root>
          {title ? <Typography variant={'button'}>{title}</Typography> : ''}
          <MUIBreadcrumbs>
            {filteredPaths.map((item, i) => {
              return (
                <Link key={i} component={RouterLink} to={item.value!}>
                  <Typography variant={'button'}>{item.name}</Typography>
                </Link>
              );
            })}
          </MUIBreadcrumbs>
        </Root>
      )}
    </>
  );
};

export default Breadcrumbs;
