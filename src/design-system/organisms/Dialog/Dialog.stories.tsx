import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from './Dialog';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';

const meta: Meta<typeof Dialog> = {
  title: 'Organisms/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    open: true,
    title: 'Dialog Title',
    children: <Typography>Dialog content goes here.</Typography>,
    actions: (
      <>
        <Button onClick={() => {}}>Cancel</Button>
        <Button onClick={() => {}} variant="contained">
          Confirm
        </Button>
      </>
    ),
  },
};
