import { StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta = {
  title: 'Design System/Atoms/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: ['primary', 'secondary', 'inherit'] },
    size: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    color: 'primary',
  },
};

export const Small: Story = {
  args: {
    size: 20,
  },
};
