/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@/main/test/testUtils';
import { ApplicationButton, ApplicationButtonProps } from './ApplicationButton';
import { _AUTH_LOGIN_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../constants/ApplicationState';
import { expect, test } from 'vitest';

test.skip('buttons is loading', () => {
  // arrange
  const props = {
    loading: true,
    onJoin: () => void 0,
  } as ApplicationButtonProps;
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

test.skip('not authenticated', () => {
  // arrange
  const props = {
    loading: false,
    isAuthenticated: false,
    onJoin: () => void 0,
  } as ApplicationButtonProps;
  render(
    <MemoryRouter>
      <ApplicationButton {...props} />
    </MemoryRouter>
  );
  // act

  // assert
  const button = screen.getByText('Sign in to apply') as HTMLAnchorElement;

  expect(button).toBeInTheDocument();
  expect(button.href).toContain(_AUTH_LOGIN_PATH);
  expect(button).toBeEnabled();
});

test.skip('is member', () => {
  // arrange
  const props = {
    loading: false,
    isAuthenticated: true,
    onJoin: () => void 0,
    isMember: true,
  } as ApplicationButtonProps;

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

[APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED].forEach(x =>
  test.skip(`${x}`, () => {
    // arrange
    const props = {
      loading: false,
      isAuthenticated: true,
      onJoin: () => void 0,
      isMember: false,
      applicationState: x,
    } as ApplicationButtonProps;

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

test.skip('can join community', () => {
  // arrange
  const props = {
    loading: false,
    isAuthenticated: true,
    onJoin: () => void 0,
    isMember: false,
    canJoinCommunity: true,
  } as ApplicationButtonProps;

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

test.skip('can apply to community', () => {
  // arrange
  const props = {
    loading: false,
    isAuthenticated: true,
    onJoin: () => void 0,
    isMember: false,
    canApplyToCommunity: true,
    applyUrl: 'space1/apply',
  } as ApplicationButtonProps;

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
  expect(button['href']).toContain('space1/apply');
});

test.skip('isParentMember & CANT apply & CANT join', () => {
  // arrange
  const props = {
    loading: false,
    isAuthenticated: true,
    onJoin: () => void 0,
    isMember: false,
    isParentMember: true,
    canJoinCommunity: false,
    canApplyToCommunity: false,
  } as ApplicationButtonProps;

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

test.skip('parent has pending application', () => {
  // arrange
  const props = {
    loading: false,
    isAuthenticated: true,
    onJoin: () => void 0,
    isMember: false,
    isParentMember: false,
    parentApplicationState: APPLICATION_STATE_NEW,
  } as ApplicationButtonProps;

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

test.skip('can join parent', () => {
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
  } as ApplicationButtonProps;

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

test.skip('can apply to parent', () => {
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
  } as ApplicationButtonProps;

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

test.skip('cant do anything - default state', () => {
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
  } as ApplicationButtonProps;

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

test.skip('is opening', async () => {
  // arrange
  const props = {
    loading: false,
    isAuthenticated: true,
    onJoin: () => void 0,
    isMember: false,
    canJoinCommunity: true,
  } as ApplicationButtonProps;

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

test.skip('parent type & is opening', async () => {
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
    parentUrl: '/parent/apply',
  } as ApplicationButtonProps;

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

  const title = screen.getByText('Want to join the parent Space?');
  expect(title).toBeInTheDocument();
});
