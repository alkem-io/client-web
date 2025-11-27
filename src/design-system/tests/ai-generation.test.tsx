import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, FormField, Input, Button, Typography } from '../index';
import { Box } from '@mui/material';
import { describe, it, expect } from 'vitest';

// This component mimics what an AI would generate based on quickstart.md
const GeneratedLoginForm = () => {
  return (
    <Card raised>
      <Box p={3} display="flex" flexDirection="column" gap={2}>
        <Typography variant="h5">Login</Typography>
        <FormField label="Email">
          <Input fullWidth placeholder="Enter your email" />
        </FormField>
        <FormField label="Password">
          <Input fullWidth type="password" placeholder="Enter your password" />
        </FormField>
        <Button variant="contained" color="primary">
          Login
        </Button>
      </Box>
    </Card>
  );
};

describe('AI Generation Validation', () => {
  it('renders the generated Login Form correctly', () => {
    render(<GeneratedLoginForm />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
