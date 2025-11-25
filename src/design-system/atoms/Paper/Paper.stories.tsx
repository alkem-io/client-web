import type { Meta, StoryObj } from '@storybook/react-vite';
import { Paper } from './Paper';
import { Typography } from '../Typography/Typography';

const meta: Meta<typeof Paper> = {
  title: 'Design System/Atoms/Paper',
  component: Paper,
  tags: ['autodocs'],
  argTypes: {
    elevation: { control: { type: 'number', min: 0, max: 24 } },
    variant: { control: 'select', options: ['elevation', 'outlined'] },
    square: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Paper>;

export const Elevation: Story = {
  args: {
    elevation: 3,
    children: <Typography sx={{ p: 2 }}>Elevation 3</Typography>,
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: <Typography sx={{ p: 2 }}>Outlined</Typography>,
  },
};
