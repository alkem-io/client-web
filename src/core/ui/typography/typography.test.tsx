import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { BlockSectionTitle, Caption, CaptionSmall, CardText, PageTitle, Text } from './components';
import { resolveColor, resolveSx } from './sx';
import Typography from './Typography';

describe('Typography (MUI-free)', () => {
  test('renders the variant default element and reproduces its font metrics', () => {
    render(<Typography variant="h2">Heading</Typography>);
    const el = screen.getByText('Heading');
    // h2 → semantic <h2> per VARIANT_ELEMENT (PageTitle component override aside).
    expect(el.tagName).toBe('H2');
    expect(el.style.fontFamily).toContain('Montserrat');
    expect(el.style.fontWeight).toBe('700');
    expect(el.style.fontSize).toBe(`${18 / 16}rem`);
  });

  test('renders no @mui markup — plain inline style only', () => {
    render(<Caption>cap</Caption>);
    const el = screen.getByText('cap');
    expect(el.className).not.toContain('Mui');
    // caption variant size 12px → 0.75rem
    expect(el.style.fontSize).toBe(`${12 / 16}rem`);
    expect(el.style.display).toBe('block');
  });

  test('component prop overrides the rendered element', () => {
    render(
      <Text component="span" data-testid="t">
        body
      </Text>
    );
    expect(screen.getByTestId('t').tagName).toBe('SPAN');
  });

  test('color prop resolves MUI palette paths to CSS colors', () => {
    render(<Text color="text.secondary">muted</Text>);
    expect(screen.getByText('muted').style.color).toBe('rgba(0, 0, 0, 0.6)');
  });

  test('noWrap applies the ellipsis truncation styles', () => {
    render(<BlockSectionTitle noWrap={true}>long</BlockSectionTitle>);
    const el = screen.getByText('long');
    expect(el.style.whiteSpace).toBe('nowrap');
    expect(el.style.overflow).toBe('hidden');
    expect(el.style.textOverflow).toBe('ellipsis');
  });

  test('sx object applies CSS and resolves spacing against the 10px unit', () => {
    render(<Caption sx={{ mt: 1, padding: 2, color: 'error.main' }}>x</Caption>);
    const el = screen.getByText('x');
    expect(el.style.marginTop).toBe('10px');
    expect(el.style.padding).toBe('20px');
    expect(el.style.color).toBe('rgb(211, 47, 47)'); // #D32F2F
  });

  test('sx theme-callback breakpoint blocks collapse to the base style', () => {
    render(
      <Caption
        sx={(theme: { breakpoints: { up: (k: string) => string } }) => ({
          textAlign: 'center',
          [theme.breakpoints.up('md')]: { textAlign: 'left' },
        })}
      >
        y
      </Caption>
    );
    expect(screen.getByText('y').style.textAlign).toBe('center');
  });

  test('CardText reproduces the lightened text color', () => {
    render(<CardText>card</CardText>);
    expect(screen.getByText('card').style.color).toBe('rgb(116, 116, 134)'); // #747486
  });

  test('CaptionSmall is italic', () => {
    render(<CaptionSmall>small</CaptionSmall>);
    expect(screen.getByText('small').style.fontStyle).toBe('italic');
  });

  test('PageTitle renders as h1 (component override) with h2 metrics', () => {
    render(<PageTitle>title</PageTitle>);
    const el = screen.getByText('title');
    expect(el.tagName).toBe('H1');
    expect(el.style.fontSize).toBe(`${18 / 16}rem`);
  });
});

describe('sx resolver', () => {
  test('resolveColor maps known palette keys and passes through CSS colors', () => {
    expect(resolveColor('primary.main')).toBe('#1D384A');
    expect(resolveColor('#abcdef')).toBe('#abcdef');
  });

  test('resolveSx flattens the MUI array form left→right', () => {
    expect(resolveSx([{ mt: 1 }, { mt: 2 }])).toMatchObject({ marginTop: '20px' });
  });

  test('resolveSx returns the base when sx is falsy', () => {
    expect(resolveSx(undefined, { color: 'red' })).toEqual({ color: 'red' });
  });
});
