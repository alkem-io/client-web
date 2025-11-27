import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardMedia, CardActions } from './Card';
import { Button } from '../../atoms/Button/Button';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Typography } from '../../atoms/Typography/Typography';

const meta: Meta<typeof Card> = {
  title: 'Design System/Molecules/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <Typography>This is a simple card with just content.</Typography>,
  },
};

export const WithHeader: Story = {
  args: {
    header: (
      <CardHeader
        avatar={<Avatar alt="Recipe">R</Avatar>}
        title="Shrimp and Chorizo Paella"
        subheader="September 14, 2016"
      />
    ),
    children: (
      <Typography variant="body2" color="text.secondary">
        This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of
        frozen peas along with the mussels, if you like.
      </Typography>
    ),
  },
};

export const WithMedia: Story = {
  args: {
    media: (
      <CardMedia
        component="img"
        height="194"
        image="https://mui.com/static/images/cards/paella.jpg"
        alt="Paella dish"
      />
    ),
    children: (
      <Typography variant="body2" color="text.secondary">
        This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of
        frozen peas along with the mussels, if you like.
      </Typography>
    ),
  },
};

export const Complex: Story = {
  args: {
    header: (
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" alt="Recipe">
            R
          </Avatar>
        }
        title="Shrimp and Chorizo Paella"
        subheader="September 14, 2016"
      />
    ),
    media: (
      <CardMedia
        component="img"
        height="194"
        image="https://mui.com/static/images/cards/paella.jpg"
        alt="Paella dish"
      />
    ),
    children: (
      <Typography variant="body2" color="text.secondary">
        This impressive paella is a perfect party dish and a fun meal to cook together with your guests. Add 1 cup of
        frozen peas along with the mussels, if you like.
      </Typography>
    ),
    actions: (
      <CardActions disableSpacing>
        <Button>Share</Button>
        <Button>Learn More</Button>
      </CardActions>
    ),
  },
};
