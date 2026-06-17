/**
 * @jest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { render, screen } from '@/main/test/testUtils';
import Loading from './Loading';

describe('Loading component', () => {
  test('renders the loading message', () => {
    // arrange
    const message = 'Loading indicator';

    // act
    render(<Loading text={message} />);

    // assert
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('renders the default loading text', () => {
    // act
    render(<Loading />);

    // assert
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
