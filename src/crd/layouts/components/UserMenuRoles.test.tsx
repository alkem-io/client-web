import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { UserMenuRoles } from './UserMenuRoles';

/**
 * The caption under the user's name in the avatar menu. A holder of several
 * platform roles is labelled by the strongest, with a "+N" for the rest and
 * the full precedence-ordered list exposed for hover and assistive tech.
 */
describe('UserMenuRoles', () => {
  test('renders nothing when the user holds no roles', () => {
    const { container } = render(<UserMenuRoles roles={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('a single role renders its label and no count', () => {
    render(<UserMenuRoles roles={['Platform Support']} />);

    expect(screen.getByText('Platform Support')).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  test('several roles render the first (strongest) label plus a +N count', () => {
    render(<UserMenuRoles roles={['Platform Roles Admin', 'Platform Support', 'Beta Tester']} />);

    expect(screen.getByText('Platform Roles Admin')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.queryByText('Platform Support')).not.toBeInTheDocument();
  });

  test('the full list is exposed on hover and to assistive tech', () => {
    render(<UserMenuRoles roles={['Platform Roles Admin', 'Platform Support']} />);

    const caption = screen.getByTitle('Platform Roles Admin, Platform Support');
    // The "+1" is decoration; assistive tech reads the strongest role followed by the rest.
    expect(screen.getByText('+1')).toHaveAttribute('aria-hidden', 'true');
    expect(caption).toHaveTextContent('Platform Roles Admin+1, Platform Support');
  });

  test('a single role needs no tooltip', () => {
    render(<UserMenuRoles roles={['Platform Support']} />);

    expect(screen.getByText('Platform Support')).not.toHaveAttribute('title');
  });
});
