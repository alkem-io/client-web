import { describe, expect, it } from 'vitest';
import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { type CalloutMenuPermissionsInput, deriveCalloutMenuVisibility } from './deriveCalloutMenuVisibility';

const baseInput: CalloutMenuPermissionsInput = {
  myPrivileges: [AuthorizationPrivilege.Read],
  visibility: CalloutVisibility.Published,
  canMoveSet: false,
  contributionsEnabled: false,
  contributionsCount: 0,
  isTaskBoard: false,
  canBeSavedAsTemplate: false,
  saveAsTemplateFeatureEnabled: false,
  isCollaboraDocument: false,
  hasMoveNeighbours: false,
};

const withUpdate = (input: Partial<CalloutMenuPermissionsInput> = {}): CalloutMenuPermissionsInput => ({
  ...baseInput,
  myPrivileges: [AuthorizationPrivilege.Read, AuthorizationPrivilege.Update],
  canMoveSet: true,
  ...input,
});

describe('deriveCalloutMenuVisibility', () => {
  it('read-only user sees only Share (no edit/publish/unpublish/delete/sort/move)', () => {
    const perms = deriveCalloutMenuVisibility(baseInput);
    expect(perms.showEdit).toBe(false);
    expect(perms.showPublish).toBe(false);
    expect(perms.showUnpublish).toBe(false);
    expect(perms.showDelete).toBe(false);
    expect(perms.showSortContributions).toBe(false);
    expect(perms.showSaveAsTemplate).toBe(false);
    expect(perms.movable).toBe(false);
    expect(perms.showShare).toBe(true);
  });

  it('Update privilege + Draft → shows Edit + Publish + Delete (not Unpublish)', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ visibility: CalloutVisibility.Draft }));
    expect(perms.isDraft).toBe(true);
    expect(perms.showEdit).toBe(true);
    expect(perms.showPublish).toBe(true);
    expect(perms.showUnpublish).toBe(false);
    expect(perms.showDelete).toBe(true);
  });

  it('Update privilege + Published → shows Edit + Unpublish + Delete (not Publish)', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ visibility: CalloutVisibility.Published }));
    expect(perms.isDraft).toBe(false);
    expect(perms.showEdit).toBe(true);
    expect(perms.showPublish).toBe(false);
    expect(perms.showUnpublish).toBe(true);
    expect(perms.showDelete).toBe(true);
  });

  it('Sort Contributions hidden when contributions disabled', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ contributionsEnabled: false, contributionsCount: 5 }));
    expect(perms.showSortContributions).toBe(false);
  });

  it('Sort Contributions hidden when fewer than 2 contributions', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ contributionsEnabled: true, contributionsCount: 1 }));
    expect(perms.showSortContributions).toBe(false);
  });

  it('Sort Contributions shown when enabled + 2+ contributions + Update', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ contributionsEnabled: true, contributionsCount: 2 }));
    expect(perms.showSortContributions).toBe(true);
  });

  it('Sort Contributions hidden for a Tasks board even when otherwise eligible (board reorders via drag-and-drop)', () => {
    const perms = deriveCalloutMenuVisibility(
      withUpdate({ contributionsEnabled: true, contributionsCount: 5, isTaskBoard: true })
    );
    expect(perms.showSortContributions).toBe(false);
  });

  it('Save-as-Template requires: Update + canBeSavedAsTemplate + feature flag', () => {
    expect(
      deriveCalloutMenuVisibility(withUpdate({ canBeSavedAsTemplate: true, saveAsTemplateFeatureEnabled: false }))
        .showSaveAsTemplate
    ).toBe(false);
    expect(
      deriveCalloutMenuVisibility(withUpdate({ canBeSavedAsTemplate: false, saveAsTemplateFeatureEnabled: true }))
        .showSaveAsTemplate
    ).toBe(false);
    expect(
      deriveCalloutMenuVisibility(
        withUpdate({
          canBeSavedAsTemplate: true,
          saveAsTemplateFeatureEnabled: true,
          myPrivileges: [AuthorizationPrivilege.Read],
        })
      ).showSaveAsTemplate
    ).toBe(false);
    expect(
      deriveCalloutMenuVisibility(withUpdate({ canBeSavedAsTemplate: true, saveAsTemplateFeatureEnabled: true }))
        .showSaveAsTemplate
    ).toBe(true);
  });

  it('document callout: Save-as-Template shown but greyed out (not yet supported)', () => {
    const perms = deriveCalloutMenuVisibility(
      withUpdate({
        // Documents may not carry the backend flag, yet the item still appears…
        canBeSavedAsTemplate: false,
        saveAsTemplateFeatureEnabled: true,
        isCollaboraDocument: true,
      })
    );
    expect(perms.showSaveAsTemplate).toBe(true);
    expect(perms.saveAsTemplateDisabled).toBe(true);
  });

  it('non-document callout: Save-as-Template is enabled (not greyed out)', () => {
    const perms = deriveCalloutMenuVisibility(
      withUpdate({ canBeSavedAsTemplate: true, saveAsTemplateFeatureEnabled: true })
    );
    expect(perms.showSaveAsTemplate).toBe(true);
    expect(perms.saveAsTemplateDisabled).toBe(false);
  });

  it('Replace file hidden for a non-document callout even with Update', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ isCollaboraDocument: false }));
    expect(perms.showReplace).toBe(false);
  });

  it('Replace file hidden for a document callout without edit rights', () => {
    const perms = deriveCalloutMenuVisibility({
      ...baseInput,
      isCollaboraDocument: true,
      collaboraDocumentType: 'WORDPROCESSING',
    });
    expect(perms.showReplace).toBe(false);
  });

  it('Replace file shown for an editable Phase-1 document callout', () => {
    const perms = deriveCalloutMenuVisibility(
      withUpdate({ isCollaboraDocument: true, collaboraDocumentType: 'WORDPROCESSING' })
    );
    expect(perms.showReplace).toBe(true);
  });

  it('Replace file hidden for a non-Phase-1 document type (Drawing would dead-end)', () => {
    const perms = deriveCalloutMenuVisibility(
      withUpdate({ isCollaboraDocument: true, collaboraDocumentType: 'DRAWING' })
    );
    expect(perms.showReplace).toBe(false);
  });

  it('Move items hidden when the feed has no neighbours (isTop === isBottom)', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ hasMoveNeighbours: false }));
    expect(perms.movable).toBe(false);
  });

  it('Move items shown when calloutsSet Update + hasMoveNeighbours', () => {
    const perms = deriveCalloutMenuVisibility(withUpdate({ hasMoveNeighbours: true }));
    expect(perms.movable).toBe(true);
  });

  it('Move items hidden when calloutsSet lacks Update even with neighbours', () => {
    const perms = deriveCalloutMenuVisibility(
      withUpdate({
        hasMoveNeighbours: true,
        canMoveSet: false,
      })
    );
    expect(perms.movable).toBe(false);
  });

  it('undefined myPrivileges treated as "no privileges"', () => {
    const perms = deriveCalloutMenuVisibility({
      ...baseInput,
      myPrivileges: undefined,
    });
    expect(perms.showEdit).toBe(false);
    expect(perms.movable).toBe(false);
  });
});
