import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { VCContentView, type VCContentViewProps } from '../VCContentView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const noneRequiredContent = <p className="text-body text-muted-foreground">No special member rights required</p>;

const monitoringBody = (
  <p>
    Read the{' '}
    <a href="https://welcome.alkem.io/legal/#tc" target="_blank" rel="noreferrer">
      Terms &amp; Conditions
    </a>{' '}
    for details.
  </p>
);

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
  roleRequirementsContent: noneRequiredContent,
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
    heading: 'Monitoring by Alkemio',
    body: monitoringBody,
  },
  labels: {
    functionalityHeading: 'Functionality',
    capabilitiesTitle: 'Functional Capabilities',
    dataAccessTitle: 'Data access from the Space where it is a member',
    roleRequirementsTitle: 'Role Requirements',
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
    expect(screen.getByRole('heading', { level: 2, name: 'Monitoring by Alkemio' })).toBeTruthy();
  });

  test('renders three Functionality cards with all bullet labels', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByText('Functional Capabilities')).toBeTruthy();
    expect(screen.getByText('Data access from the Space where it is a member')).toBeTruthy();
    expect(screen.getByText('Role Requirements')).toBeTruthy();
    expect(screen.getByText('Answer questions in comments')).toBeTruthy();
    expect(screen.getByText('About page')).toBeTruthy();
  });

  test('Role Requirements `noneRequired` content renders the supplied paragraph', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByText('No special member rights required')).toBeTruthy();
  });

  test('Role Requirements `memberRequired` content can render a real <strong>', () => {
    const memberRequiredContent = (
      <p>
        This VC needs <strong>member rights</strong> in the Space.
      </p>
    );
    const props: VCContentViewProps = {
      ...baseProps,
      functionality: { ...baseProps.functionality, roleRequirements: { kind: 'memberRequired' } },
      roleRequirementsContent: memberRequiredContent,
    };
    const { container } = render(<VCContentView {...props} />);
    const strong = container.querySelector('strong');
    expect(strong).toBeTruthy();
    expect(strong?.textContent).toBe('member rights');
    expect(container.innerHTML).not.toContain('&lt;strong&gt;');
  });

  test('renders exactly six transparency cards in fixed order', () => {
    render(<VCContentView {...baseProps} />);
    const expectedOrder = [
      'Open Model Transparency',
      'Data Usage Disclosure',
      'Knowledge Restriction',
      'Web Access',
      'Physical Location',
      'Technical References',
    ];
    // The transparency cards are rendered as <h3> headings inside their cards.
    // Querying by role + level guarantees we read them in DOM (visual) order
    // rather than each lookup's first-match order, which is what makes this
    // test actually verify the contract its name advertises.
    const cardHeadings = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent ?? '');
    const renderedOrder = expectedOrder.filter(name => cardHeadings.includes(name));
    const orderedSubset = cardHeadings.filter(name => expectedOrder.includes(name));
    expect(orderedSubset).toEqual(renderedOrder);
    expect(orderedSubset).toEqual(expectedOrder);
  });

  test('Technical References card with empty href renders the "Not available" italic caption (not a button)', () => {
    render(<VCContentView {...baseProps} />);
    expect(screen.getByText('Not available')).toBeTruthy();
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
    expect(screen.getAllByText('Unknown').length).toBeGreaterThanOrEqual(1);
  });

  test('Monitoring body renders the consumer-supplied node verbatim (no escaped HTML)', () => {
    const { container } = render(<VCContentView {...baseProps} />);
    const tcLink = container.querySelector('a[href="https://welcome.alkem.io/legal/#tc"]') as HTMLAnchorElement | null;
    expect(tcLink).toBeTruthy();
    expect(tcLink?.getAttribute('target')).toBe('_blank');
    expect(container.innerHTML).not.toContain('&lt;a&gt;');
    expect(container.innerHTML).not.toContain('&lt;/a&gt;');
  });
});
