import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snackbar } from './Snackbar';
import { Button } from '../Button/Button';
import React from 'react';

const meta: Meta<typeof Snackbar> = {
  title: 'Design System/Atoms/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    message: { control: 'text' },
    severity: { control: 'select', options: ['success', 'info', 'warning', 'error'] },
  },
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

export const Default: Story = {
  args: {
    open: true,
    message: 'Note archived',
  },
};

export const WithSeverity: Story = {
  args: {
    open: true,
    message: 'This is a success message!',
    severity: 'success',
  },
};

export const Interactive: Story = {
  render: args => {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
      setOpen(true);
    };

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
    };

    return (
      <div>
        <Button onClick={handleClick}>Open Snackbar</Button>
        <Snackbar {...args} open={open} autoHideDuration={6000} onClose={handleClose} />
      </div>
    );
  },
  args: {
    message: 'Snackbar open!',
  },
};
