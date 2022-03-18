import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '../../../../utils/test/test-utils';
import { ApplicationButton } from './ApplicationButton';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED, AUTH_LOGIN_PATH } from '../../../../models/constants';

describe('ApplicationButton component', () => {
  test('buttons is loading', () => {
    // arrange
    const props = {
      loading: true,
      onJoin: () => void 0,
    };
    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('not authenticated', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: false,
      onJoin: () => void 0,
    };
    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByText('Sign in to apply') as HTMLAnchorElement;

    expect(button).toBeInTheDocument();
    expect(button.href).toContain(AUTH_LOGIN_PATH);
    expect(button).toBeEnabled();
  });

  test('is member', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: true,
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Member');
    expect(button).toBeDisabled();
  });

  describe('has pending application', () => {
    [APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED].forEach(x =>
      test(x, () => {
        // arrange
        const props = {
          loading: false,
          isAuthenticated: true,
          onJoin: () => void 0,
          isMember: false,
          applicationState: x,
        };

        render(
          <MemoryRouter>
            <ApplicationButton {...props} />
          </MemoryRouter>
        );
        // act

        // assert
        const button = screen.getByRole('button') as HTMLButtonElement;
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Application pending');
        expect(button).toBeDisabled();
      })
    );
  });

  test('can join community', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      canJoinCommunity: true,
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Join');
  });

  test('can apply to community', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      canApplyToCommunity: true,
      applyUrl: 'hub1/apply',
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('link');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Apply');
    expect(button['href']).toContain('hub1/apply');
  });

  test('isParentMember & CANT apply & CANT join', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      isParentMember: true,
      canJoinCommunity: false,
      canApplyToCommunity: false,
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Applications not enabled');
  });

  test('parent has pending application', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      isParentMember: false,
      parentApplicationState: APPLICATION_STATE_NEW,
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Parent application pending');
  });

  test('can join parent', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      isParentMember: false,
      canJoinCommunity: false,
      canApplyToCommunity: false,
      canJoinParentCommunity: true,
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Join parent');
  });

  test('can apply to parent', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      isParentMember: false,
      canJoinCommunity: false,
      canApplyToCommunity: false,
      canJoinParentCommunity: false,
      canApplyToParentCommunity: true,
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Apply to parent');
  });

  test('cant do anything - default state', () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      isParentMember: false,
      canJoinCommunity: false,
      canApplyToCommunity: false,
      canJoinParentCommunity: false,
      canApplyToParentCommunity: false,
    };

    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Applications not enabled');
  });

  describe('join dialog', () => {
    test('is opening', async () => {
      // arrange
      const props = {
        loading: false,
        isAuthenticated: true,
        onJoin: () => void 0,
        isMember: false,
        canJoinCommunity: true,
      };

      render(
        <MemoryRouter>
          <ApplicationButton {...props} />
        </MemoryRouter>
      );
      // act
      const button = screen.getByText('Join');
      fireEvent.click(button);

      // assert
      await screen.findByRole('dialog');
      const dialog = screen.getByRole('dialog');

      expect(dialog).toBeInTheDocument();
    });
  });

  describe("'apply to parent' dialog", () => {
    test('parent type & is opening', async () => {
      // arrange
      const props = {
        loading: false,
        isAuthenticated: true,
        onJoin: () => void 0,
        isMember: false,
        isParentMember: false,
        canJoinCommunity: false,
        canApplyToCommunity: false,
        canJoinParentCommunity: false,
        canApplyToParentCommunity: true,
        parentApplyUrl: '/parent/apply',
      };

      render(
        <MemoryRouter>
          <ApplicationButton {...props} />
        </MemoryRouter>
      );
      // act
      const button = screen.getByText('Apply to parent');
      fireEvent.click(button);

      // assert
      await screen.findByRole('dialog');
      const dialog = screen.getByRole('dialog');

      expect(dialog).toBeInTheDocument();

      const dialogButton = screen.getByText('Apply');
      expect(dialogButton).toHaveAttribute('href');
      expect(dialogButton['href']).toContain('/parent/apply');

      const title = screen.getByText('Want to join the parent Hub?');
      expect(title).toBeInTheDocument();
    });
  });
});
