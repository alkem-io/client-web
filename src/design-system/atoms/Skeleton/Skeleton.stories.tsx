import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Design System/Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'rectangular', 'rounded', 'circular'] },
    width: { control: 'number' },
    height: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = {
  args: {
    variant: 'text',
    width: 210,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 210,
    height: 118,
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 40,
    height: 40,
  },
};
