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
    expect(screen.getByRole('status')).toHaveAccessibleName(message);
  });

  test('renders a spinner with the localized accessible name by default', () => {
    // act
    render(<Loading />);

    // assert — no visible caption, but the status region is named via the `loading` i18n key
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading');
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });
});
