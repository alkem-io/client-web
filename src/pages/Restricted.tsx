import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/core/Button';
import Section from '../components/core/Section';
import Typography from '../components/core/Typography';
import { useUpdateNavigation } from '../hooks/useNavigation';

const paths = { currentPaths: [] };

export const Restricted: FC<{ attemptedTarget: string }> = ({ attemptedTarget }) => {
  useUpdateNavigation(paths);

  return (
    <Section>
      <Typography as="h1" variant="h1" color="negative">
        Restricted
      </Typography>
      <Typography as="h5">
        To access <b>{attemptedTarget}</b> elevated priviliges are required. Please contact your administrator for
        support.
      </Typography>
      <div>
        <Button inset as={Link} to="/" text="Take me home" />
      </div>
    </Section>
  );
};
