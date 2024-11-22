/**
 * @jest-environment jsdom
 */
import React from 'react';
import Tag from './Tag';
import { render } from '@/main/test/testUtils';
import { test, describe } from 'vitest';

describe('Tag component', () => {
  test.skip('check Tag with message', async () => {
    // arrange
    const message = 'Tag message';

    // act
    render(<Tag text={message} />);

    // assert
    //toDo - extend toBeInTheDocument expect(screen.getByText(message)).toBeInTheDocument();
  });
});
