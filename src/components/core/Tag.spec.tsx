import renderer from 'react-test-renderer';
import React from 'react';
import Tag from './Tag';
import Typography from './Typography';
import { render, screen } from '@testing-library/react';

describe('Tag component', () => {
  test('render correctly Typography component', () => {
    // arrange
    const { asFragment } = render(<Typography variant="caption" color="inherit" />);

    // act
    const html = asFragment();

    // assert
    expect(html).toMatchSnapshot();
  });

  test('render correctly Tag component', () => {
    // arrange
    const text = 'Please wait';

    // act
    const TextComponent = renderer.create(<Tag text={text} />).toJSON();

    // assert
    expect(TextComponent).toMatchSnapshot();
  });

  test('check Tag with message', async () => {
    // arrange
    const message = 'Tag message';

    // act
    render(<Tag text={message} />);

    // assert
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
