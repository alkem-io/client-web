import React, { FC, useMemo } from 'react';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import { Container, Link, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import Button from '../../components/core/Button';
import Card from '../../components/core/Card';

import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '..';
import { Loading } from '../../components/core';

interface Props extends PageProps {
  data: Array<{
    name: string;
    buttons: Array<{
      description: string;
      url: string;
    }>;
  }>;
  title?: string;
  entityUrl?: string;
  loading?: boolean;
}

export const ManagementPageTemplatePage: FC<Props> = ({ title, entityUrl, data, paths, loading = false }) => {
  const { url } = useRouteMatch();

  useUpdateNavigation({ currentPaths: paths });

  const titleElement = useMemo(
    () =>
      entityUrl ? (
        <Link component={RouterLink} to={entityUrl}>
          {title}
        </Link>
      ) : (
        title
      ),
    [entityUrl, title]
  );

  if (loading) return <Loading />;

  return (
    <Container maxWidth="xl">
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Typography variant="h2">{titleElement}</Typography>
        </Grid>
        {data.map((x, i) => (
          <Grid item key={i}>
            <Card
              key={i}
              classes={{
                background: theme => theme.palette.neutral.main,
              }}
              primaryTextProps={{
                text: x.name || '',
                classes: {
                  color: theme => theme.palette.neutral.main,
                  lineHeight: '36px',
                },
              }}
            >
              <Grid container spacing={2}>
                {x.buttons.map((btn, index) => (
                  <Grid key={index} item>
                    <Button as={RouterLink} to={`${url}${btn.url}`} text={btn.description} />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ManagementPageTemplatePage;
