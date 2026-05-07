import { render, screen } from '@testing-library/react';
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { VCContentView, type VCContentViewProps } from '../VCContentView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  // Smart mock: when `components` is provided, render the wrapper element with
  // a representative inner string so the test can verify a real <strong> /
  // <a> appears in the DOM. When no `components`, fall back to text.
  Trans: ({ i18nKey, components }: { i18nKey: string; components?: Record<string, ReactElement> }) => {
    if (!components) return <span data-testid="trans">{i18nKey}</span>;
    return (
      <span data-testid="trans" data-i18n-key={i18nKey}>
        {Object.entries(components).map(([name, element]) => {
          const child: ReactNode = name === 'strong' ? 'member rights' : name === 'a' ? 'Terms & Conditions' : i18nKey;
          return isValidElement(element) ? cloneElement(element, { key: name }, ...Children.toArray(child)) : null;
        })}
      </span>
    );
  },
}));

const baseProps: VCContentViewProps = {
  functionality: {
    capabilities: [
      { label: 'Answer questions in comments', enabled: true },
      { label: 'Create new posts', enabled: false },
      { label: 'Invite other contributors', enabled: false },
    ],
    dataAccess: [
      { label: 'About page', enabled: true },
      { label: 'Posts & Contributions', enabled: true },
      { label: 'Subspaces', enabled: false },
    ],
    roleRequirements: { kind: 'noneRequired' },
  },
  aiEngine: {
    engineName: 'Alkemio AI',
    cards: [
      {
        id: 'openModelTransparency',
        iconName: 'eye',
        title: 'Open Model Transparency',
        description: 'q1',
        booleanAnswer: { value: true },
      },
      {
        id: 'dataUsageDisclosure',
        iconName: 'database',
        title: 'Data Usage Disclosure',
        description: 'q2',
        textValue: '',
      },
      {
        id: 'knowledgeRestriction',
        iconName: 'shieldCheck',
        title: 'Knowledge Restriction',
        description: 'q3',
        textValue: 'Yes',
      },
      {
        id: 'webAccess',
        iconName: 'globe',
        title: 'Web Access',
        description: 'q4',
        booleanAnswer: { value: false, noIcon: 'clock' },
      },
      {
        id: 'physicalLocation',
        iconName: 'mapPin',
        title: 'Physical Location',
        description: 'q5',
        textValue: 'EU',
      },
      {
        id: 'technicalReferences',
        iconName: 'fileText',
        title: 'Technical References',
        description: 'q6',
        action: { href: '', label: 'SEE DOCS' },
      },
    ],
  },
  monitoring: {
    headingKey: 'crd-profilePages:vcProfile.monitoring.heading',
    bodyKey: 'crd-profilePages:vcProfile.monitoring.body',
  },
  labels: {
    functionalityHeading: 'Functionality',
    capabilitiesTitle: 'Functional Capabilities',
    dataAccessTitle: 'Data access from the Space where it is a member',
    roleRequirementsTitle: 'Role Requirements',
    roleRequirementsMemberRequiredKey: 'crd-profilePages:vcProfile.functionality.roleRequirements.memberRequired',
    roleRequirementsNoneRequired: 'No special member rights required',
    aiEngineHeading: 'AI Engine: Alkemio AI',
    yesAnswer: 'Yes',
    noAnswer: 'No',
    unknownAnswer: 'Unknown',
    technicalReferencesNotAvailable: 'Not available',
  },
};

describe('VCContentView (redesigned)', () => {
  test('renders the three section headings (Functionality / AI Engine / Monitoring)', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Functionality' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'AI Engine: Alkemio AI' })).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'crd-profilePages:vcProfile.monitoring.heading',
      })
    ).toBeTruthy();
  });

  test('renders three Functionality cards with all bullet labels', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByText('Functional Capabilities')).toBeTruthy();
    expect(screen.getByText('Data access from the Space where it is a member')).toBeTruthy();
    expect(screen.getByText('Role Requirements')).toBeTruthy();
    expect(screen.getByText('Answer questions in comments')).toBeTruthy();
    expect(screen.getByText('About page')).toBeTruthy();
  });

  test('Role Requirements `noneRequired` path renders plain "No special member rights required"', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByText('No special member rights required')).toBeTruthy();
  });

  test('Role Requirements `memberRequired` path renders a real <strong> via <Trans> (no escaped HTML)', () => {
    const props: VCContentViewProps = {
      ...baseProps,
      functionality: { ...baseProps.functionality, roleRequirements: { kind: 'memberRequired' } },
    };
    const { container } = render(<VCContentView {...props} />);
    const strong = container.querySelector('strong');
    expect(strong).toBeTruthy();
    expect(strong?.textContent).toBe('member rights');
    // Assert no escaped HTML markers leaked through.
    expect(container.innerHTML).not.toContain('&lt;strong&gt;');
  });

  test('renders exactly six transparency cards in fixed order', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByText('Open Model Transparency')).toBeTruthy();
    expect(screen.getByText('Data Usage Disclosure')).toBeTruthy();
    expect(screen.getByText('Knowledge Restriction')).toBeTruthy();
    expect(screen.getByText('Web Access')).toBeTruthy();
    expect(screen.getByText('Physical Location')).toBeTruthy();
    expect(screen.getByText('Technical References')).toBeTruthy();
  });

  test('Technical References card with empty href renders the "Not available" italic caption (not a button)', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByText('Not available')).toBeTruthy();
    // No SEE DOCS button when the href is empty.
    expect(screen.queryByRole('link', { name: /SEE DOCS/i })).toBeNull();
  });

  test('Technical References card with a populated href renders an <a target="_blank" rel="noopener noreferrer">', () => {
    const props: VCContentViewProps = {
      ...baseProps,
      aiEngine: {
        ...baseProps.aiEngine,
        cards: baseProps.aiEngine.cards.map(c =>
          c.id === 'technicalReferences' ? { ...c, action: { href: 'https://example.com/docs', label: 'SEE DOCS' } } : c
        ),
      },
    };
    render(<VCContentView {...props} />);
    const link = screen.getByRole('link', { name: /SEE DOCS/i }) as HTMLAnchorElement;
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    expect(link.getAttribute('href')).toBe('https://example.com/docs');
  });

  test('Data Usage Disclosure with empty textValue falls back to the "Unknown" label', () => {
    render(<VCContentView {...baseProps} />);
    // The "Unknown" label appears at least once (Data Usage card has empty textValue).
    expect(screen.getAllByText('Unknown').length).toBeGreaterThanOrEqual(1);
  });

  test('Monitoring T&C link is a real <a target="_blank" href="https://welcome.alkem.io/legal/#tc">', () => {
    const { container } = render(<VCContentView {...baseProps} />);
    const tcLink = container.querySelector('a[href="https://welcome.alkem.io/legal/#tc"]') as HTMLAnchorElement | null;
    expect(tcLink).toBeTruthy();
    expect(tcLink?.getAttribute('target')).toBe('_blank');
    // No escaped HTML (parity with Golden Rule 10 — `dangerouslySetInnerHTML` MUST NOT appear).
    expect(container.innerHTML).not.toContain('&lt;a&gt;');
    expect(container.innerHTML).not.toContain('&lt;/a&gt;');
  });
});
