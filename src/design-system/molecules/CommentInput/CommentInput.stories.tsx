import { StoryObj } from '@storybook/react-vite';
import { CommentInput } from './CommentInput';

const meta = {
  title: 'Design System/Molecules/CommentInput',
  component: CommentInput,
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
};

export default meta;
type Story = StoryObj<typeof CommentInput>;

export const Default: Story = {
  args: {
    userAvatarSrc: 'https://mui.com/static/images/avatar/1.jpg',
    userAvatarAlt: 'Remy Sharp',
  },
};
