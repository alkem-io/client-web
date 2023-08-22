import React from 'react';
import Tag from './Tag';
import { render, screen } from '../../../../main/test/testUtils';
import { expect, test } from 'vitest';

test('check Tag with message', async () => {
  // arrange
  const message = 'Tag message';

  // act
  render(<Tag text={message} />);

  // assert
  expect(screen.getByText(message)).toBeInTheDocument();
});
