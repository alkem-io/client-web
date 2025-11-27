import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Design System/Organisms/Footer',
  component: Footer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    copyright: '© 2025 Alkemio B.V.',
  },
};
