/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { TemplatesManagerView } from './TemplatesManagerView';
import { TEMPLATE_TYPE_ORDER, type TemplateType } from './types';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-templates');
});

/**
 * Regression coverage for the "Add new" dropdown wired on every template-type
 * section header (`TemplateSectionHeader`, driven by `TemplatesManagerView`).
 * Guards against a false-positive live-acceptance finding (024-classifications
 * US2-AS1/AS2/AS3) that reported the Classification section's "Add new"
 * button silently navigating away instead of opening its dropdown — not
 * reproducible against the real app (verified live), but nothing in this
 * area had test coverage before, so a regression here would previously have
 * gone undetected until the next live walk.
 */
describe('TemplatesManagerView — "Add new" dropdown per section', () => {
  it.each(
    TEMPLATE_TYPE_ORDER
  )('opens Create-new / Select-from-library for %s and never fires either as a side effect', async type => {
    const onCreate = vi.fn();
    const onImport = vi.fn();
    render(
      <TemplatesManagerView
        holderKind="space"
        categories={TEMPLATE_TYPE_ORDER.map(t => ({ type: t, templates: [] }))}
        canCreate={() => true}
        canEdit={() => true}
        canDelete={() => true}
        canImport={() => true}
        onCreate={onCreate}
        onImport={onImport}
        onTemplateAction={() => {}}
      />
    );

    const sectionIndex = TEMPLATE_TYPE_ORDER.indexOf(type);
    const addButtons = screen.getAllByRole('button', { name: 'Add new' });
    expect(addButtons).toHaveLength(TEMPLATE_TYPE_ORDER.length);

    await userEvent.click(addButtons[sectionIndex]);
    // The dropdown must actually open — Create new / Select from library become visible —
    // and clicking the trigger must not itself invoke either callback (that only happens
    // once a menu item is chosen).
    const createItems = await screen.findAllByText('Create new');
    expect(createItems.length).toBeGreaterThan(0);
    expect(onCreate).not.toHaveBeenCalled();
    expect(onImport).not.toHaveBeenCalled();

    await userEvent.click(createItems[createItems.length - 1]);
    expect(onCreate).toHaveBeenCalledExactlyOnceWith(type);
    expect(onImport).not.toHaveBeenCalled();
  });
});

describe('TemplatesManagerView — "Browse General Library" in an empty section (spec 098 FR-015, 2026-10-22)', () => {
  const card = { id: 'tpl-1', name: 'Kick-off post', description: '', tags: [], color: '#000000' };
  const renderView = (canImport: (type: TemplateType) => boolean) => {
    const onImport = vi.fn();
    render(
      <TemplatesManagerView
        holderKind="space"
        categories={TEMPLATE_TYPE_ORDER.map(t => ({
          type: t,
          templates: t === TEMPLATE_TYPE_ORDER[0] ? [{ ...card, type: t }] : [],
        }))}
        canCreate={() => true}
        canEdit={() => true}
        canDelete={() => true}
        canImport={canImport}
        onCreate={() => {}}
        onImport={onImport}
        onTemplateAction={() => {}}
      />
    );
    return onImport;
  };

  it('shows one link per empty section, opening the library for that section type', async () => {
    const onImport = renderView(() => true);
    const links = screen.getAllByRole('button', { name: 'Browse General Library' });
    expect(links).toHaveLength(TEMPLATE_TYPE_ORDER.length - 1);
    await userEvent.click(links[0]);
    expect(onImport).toHaveBeenCalledExactlyOnceWith(TEMPLATE_TYPE_ORDER[1]);
  });

  it('also shows it for a section the search filters to nothing', async () => {
    renderView(() => true);
    await userEvent.type(screen.getByRole('textbox', { name: /search/i }), 'zzz');
    expect(screen.getAllByRole('button', { name: 'Browse General Library' })).toHaveLength(TEMPLATE_TYPE_ORDER.length);
  });

  it('is absent when the user may not import that type', () => {
    renderView(() => false);
    expect(screen.queryByRole('button', { name: 'Browse General Library' })).toBeNull();
  });
});
