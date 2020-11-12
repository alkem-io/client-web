import React, { FC } from 'react';
import Button from '../components/core/Button';
import Section from '../components/core/Section';
import Typography from '../components/core/Typography';
import { useUpdateNavigation } from '../hooks/useNavigation';

const paths = { currentPaths: [] };

export const SignIn: FC<{ onSignIn: () => void }> = ({ onSignIn }) => {
  useUpdateNavigation(paths);

  return (
    <Section>
      <Typography as="h1" variant="h1">
        Authentication required
      </Typography>
      <Typography as="h5">Please sign in to access the requested resource</Typography>
      <div>
        <Button variant="primary" text="Sign in" onClick={onSignIn} />
      </div>
    </Section>
  );
};
