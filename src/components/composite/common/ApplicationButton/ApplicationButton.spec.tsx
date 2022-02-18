import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '../../../../utils/test/test-utils';
import { ApplicationButton } from './ApplicationButton';

describe.skip('ApplicationButton component', () => {
  test('render application button - not authenticated', () => {
    // arrange
    const props = {
      isAuthenticated: false,
      isMember: false,
    };
    render(
      <MemoryRouter>
        <ApplicationButton {...props} />
      </MemoryRouter>
    );
    // act

    // assert
    const button = screen.getByText('Sign in to apply');

    expect(button).toBeInTheDocument();
  });

  test('render application button - authenticated', () => {
    // arrange
    const props = {
      isAuthenticated: true,
      isMember: false,
      applyUrl: '/apply',
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
    expect(button).toHaveTextContent('Apply');
    expect(button).toHaveAttribute('href');
    expect(button['href']).toBe('http://localhost/apply');
  });

  test('render application button - disabled, status - new', () => {
    // arrange
    const props = {
      isAuthenticated: true,
      isMember: false,
      applicationState: 'new',
      applyUrl: '/apply',
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
    expect(button).toHaveTextContent('pending');
  });

  test('render application button - disabled, status - new, not parent member', () => {
    // arrange
    const props = {
      isAuthenticated: true,
      isMember: false,
      applicationState: 'new',
      parentApplicationState: 'new',
      applyUrl: '/apply',
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
    expect(button).toHaveTextContent('Application pending');
  });

  test('render application button - disabled, status - rejected', () => {
    // arrange
    const props = {
      isAuthenticated: true,
      isMember: false,
      applicationState: 'rejected',
      applyUrl: '/apply',
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
    expect(button).toHaveTextContent('Application pending');
  });

  test('render application button - disabled, member', () => {
    // arrange
    const props = {
      isAuthenticated: true,
      isMember: true,
      applicationState: 'rejected',
      applyUrl: '/apply',
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
    expect(button).toHaveTextContent('Member');
  });

  test('render application button - dialog opened', async () => {
    // arrange
    const props = {
      isAuthenticated: true,
      isMember: false,
      isNotParentMember: true,
      applyUrl: '/apply',
      parentApplyUrl: '/parent/apply',
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
    expect(button).toHaveTextContent('Apply');

    fireEvent.click(button);

    await screen.findByRole('dialog');

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const dialogButton = screen.getAllByRole('button')[0];
    expect(dialogButton).toHaveTextContent('Apply');
    expect(dialogButton).toHaveAttribute('href');
    expect(dialogButton['href']).toBe('http://localhost/parent/apply');
  });

  test('render application button - dialog opened - pending parent application', async () => {
    // arrange
    const props = {
      isAuthenticated: true,
      isMember: false,
      isNotParentMember: true,
      applyUrl: '/apply',
      parentApplyUrl: '/parent/apply',
      parentApplicationState: 'new',
      challengeName: 'test challenge',
      hubName: 'test hub',
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
    expect(button).toHaveTextContent('Apply');

    fireEvent.click(button);

    await screen.findByRole('dialog');

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const dialogButton = screen.getAllByRole('button')[1];
    expect(dialogButton).toHaveTextContent('Apply');
    expect(dialogButton).toHaveAttribute('href');
    expect(dialogButton['href']).toBe('http://localhost/apply');
  });
});
