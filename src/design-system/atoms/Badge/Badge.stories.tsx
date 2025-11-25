import { StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { Mail } from '@mui/icons-material';

const meta = {
  title: 'Design System/Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    badgeContent: { control: 'number' },
    color: { control: 'select', options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    children: <Mail />,
  },
};

export const Dot: Story = {
  args: {
    variant: 'dot',
    color: 'secondary',
    children: <Mail />,
  },
};
