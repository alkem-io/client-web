import { Container, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { PageProps } from '..';
import { Loading } from '../../common/components/core';
import Button from '../../common/components/core/Button';
import Card from '../../common/components/core/Card';
import { useUpdateNavigation } from '../../hooks';

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
                    <Button as={RouterLink} to={btn.url} text={btn.description} />
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
