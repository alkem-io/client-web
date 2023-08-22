/**
 * @jest-environment jsdom
 */
import React from 'react';
import Tag from './Tag';
import { render, screen } from '../../../../main/test/testUtils';
import { expect, test, describe } from 'vitest';
import { toBeInTheDocument } from '@testing-library/jest-dom/matchers'; // Import the toBeInTheDocument matcher

// Extend Jest's expect object with toBeInTheDocument matcher
expect.extend({ toBeInTheDocument });

describe('Tag component', () => {
  test('renders Tag with message', async () => {
    // Arrange
    const message = 'Tag message';

    // Act
    render(<Tag text={message} />);

    // Assert
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
