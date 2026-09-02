/**
 * Decorative backdrop for the auth screens — a muted, frosted-glass replica of
 * the application dashboard sitting behind the auth card. Ported from the
 * prototype `AuthPage` design. Purely decorative: no props, no state, no
 * interactivity, `aria-hidden`. The bespoke `rgba(...)` tints are kept as
 * inline styles — they are one-off decorative values with no Tailwind token.
 */

const SIDEBAR_ROWS = [
  { w: '75%', badge: true },
  { w: '88%', badge: false },
  { w: '58%', badge: false },
  { w: '72%', badge: false },
  { w: '52%', badge: false },
];

const MY_SPACES = ['rgba(234,179,8,0.45)', 'rgba(34,197,94,0.35)', 'rgba(59,130,246,0.35)'];
const RECENT_CARDS = ['rgba(180,140,60,0.3)', 'rgba(80,160,100,0.25)', 'rgba(180,80,80,0.2)', 'rgba(100,80,170,0.25)'];
const LEFT_FEED = [85, 78, 72, 80, 68, 75, 82];
const RIGHT_FEED = [76, 70, 65, 80, 58, 72];

export function AuthBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div className="absolute inset-0">
        {/* Header bar */}
        <div className="absolute inset-x-0 top-0 flex h-14 items-center gap-4 border-b border-border bg-card px-6">
          <div className="size-7 rounded" style={{ background: 'rgba(9,188,212,0.35)' }} />
          <div className="h-3 w-20 rounded" style={{ background: 'rgba(29,56,74,0.12)' }} />
          <div className="mx-auto flex h-8 max-w-lg flex-1 items-center gap-2 rounded-md border border-border bg-secondary px-3">
            <div className="size-3.5 rounded-sm bg-border" />
            <div className="h-2 w-14 rounded bg-border opacity-50" />
          </div>
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-full border border-border bg-secondary" />
            <div className="size-7 rounded-full border border-border bg-secondary" />
            <div className="size-8 rounded-full" style={{ background: 'rgba(9,188,212,0.15)' }} />
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 top-14 px-8 py-8">
          <div className="grid h-full grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-2 space-y-1">
              {SIDEBAR_ROWS.map(row => (
                <div key={`${row.w}-${row.badge}`} className="flex items-center gap-2 py-2">
                  <div className="size-4 shrink-0 rounded" style={{ background: 'rgba(29,56,74,0.18)' }} />
                  <div className="h-2.5 rounded" style={{ background: 'rgba(29,56,74,0.1)', width: row.w }} />
                  {row.badge ? (
                    <div className="ml-auto h-4 w-5 rounded-full" style={{ background: 'rgba(9,188,212,0.4)' }} />
                  ) : null}
                </div>
              ))}
              <div className="mt-3 border-t border-border pt-4">
                <div className="mb-3 h-2 w-1/2 rounded" style={{ background: 'rgba(29,56,74,0.07)' }} />
                <div className="space-y-3">
                  {MY_SPACES.map(color => (
                    <div key={color} className="flex items-center gap-2">
                      <div className="size-7 shrink-0 rounded" style={{ background: color }} />
                      <div className="h-2.5 flex-1 rounded" style={{ background: 'rgba(29,56,74,0.08)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="col-span-9">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 rounded" style={{ background: 'rgba(29,56,74,0.14)' }} />
                  <div className="h-3 w-36 rounded" style={{ background: 'rgba(9,188,212,0.3)' }} />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {RECENT_CARDS.map(color => (
                    <div key={color} className="overflow-hidden rounded-md border border-border bg-card">
                      <div className="aspect-video" style={{ background: color }} />
                      <div className="flex items-center gap-2 p-3">
                        <div className="size-8 shrink-0 rounded-lg" style={{ background: color, opacity: 0.8 }} />
                        <div className="h-3 flex-1 rounded" style={{ background: 'rgba(29,56,74,0.09)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-9 gap-6">
                <div className="col-span-5 rounded-md border border-border bg-card p-5">
                  <div className="mb-5 h-3.5 w-40 rounded" style={{ background: 'rgba(29,56,74,0.12)' }} />
                  <div className="space-y-5">
                    {LEFT_FEED.map((w, n) => (
                      <div key={`l-${w}`} className="flex items-start gap-3">
                        <div
                          className="size-9 shrink-0 rounded-full"
                          style={{ background: `hsl(${n * 50 + 10}, 30%, 78%)` }}
                        />
                        <div className="flex-1 space-y-1.5 pt-1">
                          <div
                            className="h-2.5 rounded"
                            style={{ background: 'rgba(29,56,74,0.08)', width: `${w}%` }}
                          />
                          <div className="h-2 w-1/5 rounded" style={{ background: 'rgba(29,56,74,0.04)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-4 rounded-md border border-border bg-card p-5">
                  <div className="mb-5 h-3.5 w-32 rounded" style={{ background: 'rgba(29,56,74,0.12)' }} />
                  <div className="space-y-5">
                    {RIGHT_FEED.map(w => (
                      <div key={`r-${w}`} className="flex items-start gap-3">
                        <div className="size-9 shrink-0 rounded-full" style={{ background: 'hsl(210, 22%, 78%)' }} />
                        <div className="flex-1 space-y-1.5 pt-1">
                          <div
                            className="h-2.5 rounded"
                            style={{ background: 'rgba(29,56,74,0.08)', width: `${w}%` }}
                          />
                          <div className="h-2 w-1/5 rounded" style={{ background: 'rgba(29,56,74,0.04)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frosted-glass overlay — blurs and pales the dashboard replica behind it.
          `backdropFilter` has no Tailwind equivalent; the bg-white/55 tint moves
          to a Tailwind class per the CRD styling rule. */}
      <div
        className="absolute inset-0 bg-white/55"
        style={{
          backdropFilter: 'blur(16px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
        }}
      />
    </div>
  );
}
