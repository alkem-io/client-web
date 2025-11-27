import { StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta = {
  title: 'Design System/Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Image: Story = {
  args: {
    alt: 'Remy Sharp',
    src: 'https://mui.com/static/images/avatar/1.jpg',
  },
};

export const Letter: Story = {
  args: {
    alt: 'René Honig',
    children: 'RH',
  },
};
