import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';
import { Typography } from '../Typography/Typography';
import { Box } from '@mui/material';

const meta: Meta<typeof Divider> = {
  title: 'Design System/Atoms/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: 'select',
      options: ['fullWidth', 'inset', 'middle'],
    },
    textAlign: {
      control: 'select',
      options: ['center', 'left', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {},
};

export const WithText: Story = {
  args: {
    children: 'OR',
    textAlign: 'center',
  },
  render: args => (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Typography variant="body1">Content above</Typography>
      <Divider {...args} sx={{ my: 2 }}>
        {args.children}
      </Divider>
      <Typography variant="body1">Content below</Typography>
    </Box>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    flexItem: true,
  },
  render: args => (
    <Box
      sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}
    >
      <Typography variant="body1">Left</Typography>
      <Divider {...args} sx={{ mx: 2 }} />
      <Typography variant="body1">Right</Typography>
    </Box>
  ),
};
