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

  test('renders the localized default loading text', () => {
    // act
    render(<Loading />);

    // assert — falls back to the `common.loading` i18n key, not a hardcoded string
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
