import React from 'react';
import Tag from './Tag';
import { render, screen } from '../../utils/test/test-utils';

describe('Tag component', () => {
  test('check Tag with message', async () => {
    // arrange
    const message = 'Tag message';

    // act
    render(<Tag text={message} />);

    // assert
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
