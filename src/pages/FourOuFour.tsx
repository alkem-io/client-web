import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/core/Button';
import Section from '../components/core/Section';
import Typography from '../components/core/Typography';
import './FourOuFour.css';

export const FourOuFour: FC = () => {
  return (
    <Section>
      <Typography as="h1" variant="h1">
        404
      </Typography>
      <Typography as="h5">The resource you are looking for could not be found.</Typography>
      <div>
        <Button variant="primary" as={Link} to="/" text="Take me home" />
      </div>
    </Section>
  );
};
