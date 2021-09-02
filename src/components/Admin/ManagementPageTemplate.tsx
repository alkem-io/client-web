import React, { FC, useMemo } from 'react';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import { Container, Link, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

import Button from '../core/Button';
import Card from '../core/Card';

import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '../../pages';

interface Props extends PageProps {
  data: Array<{
    name: string;
    buttons: Array<{
      description: string;
      url: string;
    }>;
  }>;
  title?: string;
  returnUrl?: string;
}

export const ManagementPageTemplate: FC<Props> = ({ title, returnUrl, data, paths }) => {
  const { url } = useRouteMatch();

  useUpdateNavigation({ currentPaths: paths });

  const titleElement = useMemo(
    () =>
      returnUrl ? (
        <Link component={RouterLink} to={returnUrl}>
          {title}
        </Link>
      ) : (
        title
      ),
    [returnUrl, title]
  );

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

export default ManagementPageTemplate;
