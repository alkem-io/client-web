import React, { FC } from 'react';
import Button from '../components/core/Button';
import Section from '../components/core/Section';
import Typography from '../components/core/Typography';
import { env } from '../env';

const graphQLEndpoint =
  (env && env.REACT_APP_GRAPHQL_ENDPOINT) ||
  (process.env.NODE_ENV === 'production' ? '/graphql' : 'http://localhost:4000/graphql');

export const Error: FC<{ error: Error }> = props => {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
      <Section>
        <Typography as="h1" variant="h1" weight="bold">
          Ooops!
        </Typography>
        <Typography as="h2" variant="h3" color="neutral">
          Looks like something went wrong: <i>{props.error.message}</i>
        </Typography>
        <Typography as="h2" variant="h3" color="neutral">
          Please check that your server ({graphQLEndpoint}) is available, and reload the page.
        </Typography>
        <Typography as="h5" variant="h5" color="neutralMedium">
          If the error persists please contact support.
        </Typography>
        <div>
          <Button variant="primary" text="Reload" onClick={() => window.location.reload()} />
        </div>
      </Section>
    </div>
  );
};
