/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { TemplatesManagerView } from './TemplatesManagerView';
import { TEMPLATE_TYPE_ORDER } from './types';

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
