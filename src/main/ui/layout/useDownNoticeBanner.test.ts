import { describe, expect, it } from 'vitest';
import { pickDownNotice } from './useDownNoticeBanner';

const NOW = Date.parse('2026-11-25T12:00:00Z');

const incident = {
  id: 'inc1',
  name: 'Platform unstable',
  status: 'investigating',
  shortlink: 'https://stspg.io/inc1',
};
const maintenance = (status: string, scheduledFor: string) => ({
  id: 'mnt1',
  name: 'Planned Database Maintenance',
  status,
  shortlink: 'https://stspg.io/mnt1',
  scheduled_for: scheduledFor,
});

describe('pickDownNotice', () => {
  it('shows nothing before the first answer or when all is well', () => {
    expect(pickDownNotice(undefined, NOW)).toBeUndefined();
    expect(pickDownNotice({ incidents: [], scheduled_maintenances: [] }, NOW)).toBeUndefined();
  });

  it('shows an unresolved incident, ahead of a running maintenance', () => {
    const notice = pickDownNotice(
      { incidents: [incident], scheduled_maintenances: [maintenance('in_progress', '2026-11-25T11:00:00Z')] },
      NOW
    );
    expect(notice).toMatchObject({ kind: 'incident', name: 'Platform unstable', href: 'https://stspg.io/inc1' });
  });

  it('shows a maintenance that is running', () => {
    const notice = pickDownNotice(
      { scheduled_maintenances: [maintenance('in_progress', '2026-11-25T11:00:00Z')] },
      NOW
    );
    expect(notice?.kind).toBe('maintenanceInProgress');
  });

  it('announces a planned maintenance from 48 hours before it starts', () => {
    const inTwoDays = pickDownNotice(
      { scheduled_maintenances: [maintenance('scheduled', '2026-11-27T12:00:00Z')] },
      NOW
    );
    expect(inTwoDays).toMatchObject({
      kind: 'maintenanceScheduled',
      scheduledFor: new Date('2026-11-27T12:00:00Z'),
    });

    const later = pickDownNotice({ scheduled_maintenances: [maintenance('scheduled', '2026-11-27T12:01:00Z')] }, NOW);
    expect(later).toBeUndefined();
  });

  it('keeps a maintenance planned until its window opens, whatever update status was posted', () => {
    const early = pickDownNotice({ scheduled_maintenances: [maintenance('verifying', '2026-11-27T12:00:00Z')] }, NOW);
    expect(early?.kind).toBe('maintenanceScheduled');

    const open = pickDownNotice({ scheduled_maintenances: [maintenance('verifying', '2026-11-25T11:00:00Z')] }, NOW);
    expect(open?.kind).toBe('maintenanceInProgress');

    const startedEarly = pickDownNotice(
      { scheduled_maintenances: [maintenance('in_progress', '2026-11-27T12:00:00Z')] },
      NOW
    );
    expect(startedEarly?.kind).toBe('maintenanceInProgress');
  });

  it('gives a status change a new key, so a dismissed notice returns', () => {
    const scheduled = pickDownNotice(
      { scheduled_maintenances: [maintenance('scheduled', '2026-11-25T13:00:00Z')] },
      NOW
    );
    const running = pickDownNotice(
      { scheduled_maintenances: [maintenance('in_progress', '2026-11-25T13:00:00Z')] },
      NOW
    );
    expect(scheduled?.key).not.toBe(running?.key);
  });

  it("links to the event on the page's current address, or its shortlink without one", () => {
    const onPage = pickDownNotice({ page: { url: 'https://alkemio.statuspage.io' }, incidents: [incident] }, NOW);
    expect(onPage?.href).toBe('https://alkemio.statuspage.io/incidents/inc1');

    expect(pickDownNotice({ incidents: [incident] }, NOW)?.href).toBe('https://stspg.io/inc1');
  });
});
