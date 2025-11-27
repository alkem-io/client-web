import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Design System/Atoms/Link',
  component: Link,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: ['primary', 'secondary', 'inherit', 'textPrimary', 'textSecondary', 'error'] },
    underline: { control: 'select', options: ['none', 'hover', 'always'] },
    variant: {
      control: 'select',
      options: [
        'body1',
        'body2',
        'button',
        'caption',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'inherit',
        'overline',
        'subtitle1',
        'subtitle2',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: '#',
    children: 'Link',
  },
};

export const UnderlineNone: Story = {
  args: {
    href: '#',
    children: 'Link',
    underline: 'none',
  },
};

export const ButtonVariant: Story = {
  args: {
    component: 'button',
    variant: 'body2',
    onClick: () => {
      console.info("I'm a button.");
    },
    children: 'Button Link',
  },
};
