import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';
import { Button } from '../../atoms/Button/Button';

const meta: Meta<typeof Header> = {
  title: 'Design System/Organisms/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    title: 'Alkemio',
    children: <Button color="inherit">Login</Button>,
  },
};
