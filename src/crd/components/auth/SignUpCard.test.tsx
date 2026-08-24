import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { KratosFlowDescriptor } from '@/crd/components/auth/flowDescriptor';
import { SignUpCard } from './SignUpCard';

// Mirror the other CRD auth tests: stub i18n so `t(key)` returns the key,
// letting us assert against the stable `signUp.signpost.*` keys.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  // <Trans> is used for the intro/terms copy, unrelated to the signpost —
  // render children as-is so those calls don't throw.
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

const descriptor = (): KratosFlowDescriptor => ({
  flowType: 'registration',
  action: 'https://example.test/registration',
  method: 'POST',
  messages: [],
  groups: {
    hidden: [],
    default: [],
    password: [],
    rest: [],
    submit: [{ name: 'method', value: 'password', label: 'Sign up', disabled: false }],
    oidc: [],
    passkey: [],
    anchors: [],
  },
});

const baseProps = {
  signInHref: '/login?returnUrl=%2Fdashboard',
  termsOfUseHref: '#',
  privacyPolicyHref: '#',
  hasAcceptedTerms: false,
  onAcceptedTermsChange: vi.fn(),
};

// qual-signpost-5: the signpost markup is the entire user-visible payload of
// FR-013/FR-014 — pin it here rather than leaving it asserted only via the
// route test's mocked `SignUpCard` sentinel (which never renders this DOM)
// or a deferred manual acceptance walk.
describe('SignUpCard — provider-arrival signpost (FR-013/FR-014)', () => {
  test('showSignpost=true renders the warning copy and a working link to signInHref', () => {
    render(<SignUpCard {...baseProps} descriptor={descriptor()} showSignpost={true} />);

    expect(screen.getByTestId('signup-signpost')).toBeInTheDocument();
    expect(screen.getByText('signUp.signpost.warning')).toBeInTheDocument();

    const signInLink = screen.getByRole('link', { name: 'signUp.signpost.signInAction' });
    expect(signInLink).toHaveAttribute('href', baseProps.signInHref);
  });

  test('showSignpost=false renders no signpost', () => {
    render(<SignUpCard {...baseProps} descriptor={descriptor()} showSignpost={false} />);

    expect(screen.queryByTestId('signup-signpost')).not.toBeInTheDocument();
  });

  test('showSignpost=true is not rendered while the card is still loading (skeleton branch)', () => {
    render(<SignUpCard {...baseProps} descriptor={descriptor()} showSignpost={true} isLoading={true} />);

    expect(screen.queryByTestId('signup-signpost')).not.toBeInTheDocument();
  });

  test('showSignpost=true is not rendered before the descriptor has loaded (no descriptor)', () => {
    render(<SignUpCard {...baseProps} showSignpost={true} />);

    expect(screen.queryByTestId('signup-signpost')).not.toBeInTheDocument();
  });
});

const continuationDescriptor = (): KratosFlowDescriptor => {
  const base = descriptor();
  return {
    ...base,
    groups: {
      ...base.groups,
      // An OIDC continuation flow has no password submit — the provider
      // submit is the only way to finish.
      submit: [],
      oidc: [
        {
          name: 'provider',
          value: 'github',
          label: 'Sign up with github',
          disabled: false,
          customisation: { providerKey: 'github', iconSrc: '/github.svg', sortOrder: 1 },
        },
      ],
    },
  };
};

describe('SignUpCard — OIDC continuation (finish signing up with a provider)', () => {
  test('providerContinuation renders the explanatory heading and intro', () => {
    render(<SignUpCard {...baseProps} descriptor={continuationDescriptor()} providerContinuation={true} />);

    const continuation = screen.getByTestId('signup-continuation');
    expect(continuation).toHaveTextContent('signUp.continuation.heading');
    expect(continuation).toHaveTextContent('signUp.continuation.intro');
  });

  test('a continuation exposing several OIDC nodes renders one CTA — the provider the label names', () => {
    // `oidcSubmitCtaLabel` is a single string derived from `groups.oidc[0]`; mapping every
    // node through it produced N identical buttons that all named the first provider while
    // submitting different values — duplicate accessible names for different actions.
    const base = continuationDescriptor();
    const multi: KratosFlowDescriptor = {
      ...base,
      groups: {
        ...base.groups,
        oidc: [
          ...base.groups.oidc,
          {
            name: 'provider',
            value: 'microsoft',
            label: 'Sign up with microsoft',
            disabled: false,
            customisation: { providerKey: 'microsoft', iconSrc: '/microsoft.svg', sortOrder: 2 },
          },
        ],
      },
    };

    render(<SignUpCard {...baseProps} descriptor={multi} providerContinuation={true} />);

    const ctas = screen.getAllByRole('button').filter(button => button.getAttribute('name') === 'provider');
    expect(ctas).toHaveLength(1);
    expect(ctas[0]).toHaveAttribute('value', 'github');
  });

  test('providerContinuation renders the provider submit as a labeled CTA, not an icon circle', () => {
    render(<SignUpCard {...baseProps} descriptor={continuationDescriptor()} providerContinuation={true} />);

    const cta = screen.getByRole('button', { name: /signUp\.continuation\.cta/ });
    expect(cta).toHaveAttribute('type', 'submit');
    expect(cta).toHaveAttribute('name', 'provider');
    expect(cta).toHaveAttribute('value', 'github');
    // The icon-circle variant carries the providers.connectWith aria-label —
    // it must not also render.
    expect(screen.queryByRole('button', { name: 'providers.connectWith' })).not.toBeInTheDocument();
  });

  test('the divider between the signpost and the continuation form renders only when both are shown', () => {
    const { rerender } = render(
      <SignUpCard
        {...baseProps}
        descriptor={continuationDescriptor()}
        providerContinuation={true}
        showSignpost={true}
      />
    );
    expect(screen.getByTestId('signup-continuation')).toHaveTextContent('signUp.continuation.divider');

    rerender(
      <SignUpCard
        {...baseProps}
        descriptor={continuationDescriptor()}
        providerContinuation={true}
        showSignpost={false}
      />
    );
    expect(screen.getByTestId('signup-continuation')).not.toHaveTextContent('signUp.continuation.divider');
  });

  test('a plain registration flow (no continuation) renders neither heading nor CTA', () => {
    render(<SignUpCard {...baseProps} descriptor={descriptor()} providerContinuation={false} />);

    expect(screen.queryByTestId('signup-continuation')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /signUp\.continuation\.cta/ })).not.toBeInTheDocument();
  });
});
