import React, { FC } from 'react';
import Button from '../components/core/Button';
import Section from '../components/core/Section';
import Typography from '../components/core/Typography';

export const Error: FC<{ error: Error }> = ({ error: Error }) => {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
      <Section>
        <Typography as="h1" variant="h1" weight="bold">
          Ooops!
        </Typography>
        <Typography as="h2" variant="h3" color="neutral">
          Looks like something went wrong. A report has been sent and the issue will be addressed soon.
        </Typography>
        <Typography as="h5" variant="h5" color="neutralMedium">
          You can continue, after reloading the page.
        </Typography>
        <div>
          <Button variant="primary" text="Reload" onClick={() => window.location.reload()} />
        </div>
      </Section>
    </div>
  );
};
