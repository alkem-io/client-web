import { describe, expect, it } from 'vitest';
import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { type CalloutMenuPermissionsInput, deriveCalloutMenuVisibility } from './deriveCalloutMenuVisibility';

const baseInput: CalloutMenuPermissionsInput = {
  myPrivileges: [AuthorizationPrivilege.Read],
  visibility: CalloutVisibility.Published,
  canMoveSet: false,
  contributionsEnabled: false,
  contributionsCount: 0,
  canBeSavedAsTemplate: false,
  saveAsTemplateFeatureEnabled: false,
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
