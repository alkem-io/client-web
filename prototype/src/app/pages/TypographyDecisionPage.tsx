import React, { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Check, AlertTriangle, Eye, Columns2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";

/* ─────────────────────────────────────────────────
   DECISION 1: Do we need text-2xs (10px)?
   ───────────────────────────────────────────────── */

function Decision1_TextSize() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Decision 1: Small Text Token</h2>
        <p className="text-muted-foreground">
          Currently <code className="text-xs bg-muted px-1 py-0.5 rounded">text-xs</code> = 12px, but ~50 places use 10px for badges/captions.
          Should we add a <code className="text-xs bg-muted px-1 py-0.5 rounded">text-2xs</code> (10px) or round up to 12px?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Option A */}
        <Card className="border-2 border-muted/30 opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">A</span>
              Add text-2xs (10px)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Keep a 10px size for compact UI elements. More precision, more tokens.</p>

            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Badges at 10px:</span>
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 font-medium" style={{ fontSize: "10px" }}>Lead</span>
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 font-medium" style={{ fontSize: "10px" }}>Member</span>
                <span className="inline-flex items-center rounded-md border bg-primary/10 text-primary px-2 py-0.5 font-medium" style={{ fontSize: "10px" }}>Private</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sidebar label at 10px:</span>
                <span className="font-semibold tracking-wider uppercase" style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>MY SPACES</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Avatar initials at 10px:</span>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold" style={{ fontSize: "10px" }}>JN</div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold" style={{ fontSize: "10px" }}>AB</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Meta text at 10px:</span>
                <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>In: Climate Action Hub · 3 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option B — CHOSEN */}
        <Card className="border-2 border-green-500 ring-2 ring-green-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"><Check className="w-3.5 h-3.5" /></span>
              Round up to text-xs (12px)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Fewer tokens, easier to maintain. Everything small becomes 12px.</p>

            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Badges at 12px:</span>
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">Lead</span>
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">Member</span>
                <span className="inline-flex items-center rounded-md border bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">Private</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sidebar label at 12px:</span>
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">MY SPACES</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Avatar initials at 12px:</span>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">JN</div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">AB</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Meta text at 12px:</span>
                <span className="text-xs text-muted-foreground">In: Climate Action Hub · 3 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   DECISION 2: Heading approach  
   ───────────────────────────────────────────────── */

function Decision2_Headings() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Decision 2: Heading System</h2>
        <p className="text-muted-foreground">
          Currently 3 systems coexist: CSS base h-tags, Tailwind classes on h-tags, and inline CSS variables.
          Which single approach do we standardize on?
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* System A — Semantic h-tags + base CSS */}
        <Card className="border-2 border-muted/30 opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">A</span>
              Semantic h-tags + base CSS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Keep theme.css base styles. Use bare <code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;h1&gt;</code>–<code className="text-xs bg-muted px-1 py-0.5 rounded">&lt;h4&gt;</code> everywhere.
            </p>
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "48px", fontWeight: 800, lineHeight: 1 }}>Page Title (h1)</h1>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "30px", fontWeight: 600, lineHeight: 1.2 }}>Section Heading (h2)</h2>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "24px", fontWeight: 600, lineHeight: 1.33 }}>Card Title (h3)</h3>
              <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", fontWeight: 600, lineHeight: 1.4 }}>Sidebar Title (h4)</h4>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Semantic HTML, good for a11y</p>
              <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Hard to override; can't use h3 styling on a div</p>
            </div>
          </CardContent>
        </Card>

        {/* System B — Tailwind utility classes — CHOSEN */}
        <Card className="border-2 border-green-500 ring-2 ring-green-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"><Check className="w-3.5 h-3.5" /></span>
              Tailwind utility classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use Tailwind classes explicitly. Heading intent is always visible in the className.
            </p>
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</p>
              <div className="text-4xl font-extrabold leading-none">Page Title (text-4xl)</div>
              <div className="text-3xl font-semibold leading-tight">Section Heading (text-3xl)</div>
              <div className="text-2xl font-semibold leading-snug">Card Title (text-2xl)</div>
              <div className="text-xl font-semibold leading-normal">Sidebar Title (text-xl)</div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Explicit, composable, easy to override</p>
              <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Can use h-tag for semantics separately from styling</p>
              <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> Slightly more verbose</p>
            </div>
          </CardContent>
        </Card>

        {/* System C — Mix (current state) */}
        <Card className="border-2 border-red-500/30 opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">C</span>
              Current state (mixed)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For comparison — what it looks like today with 3 systems fighting.
            </p>
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview — same "section heading" done 3 ways</p>
              <h2 className="text-2xl font-bold tracking-tight">About (Tailwind + tracking)</h2>
              <h2 className="text-2xl font-semibold mb-2">About (Tailwind, no tracking)</h2>
              <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>About (inline CSS vars)</h2>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> Inconsistent weight (600 vs 700)</p>
              <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> tracking-tight applied randomly</p>
              <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> 3 sources of truth</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   DECISION 3: Badge / Tag standard
   ───────────────────────────────────────────────── */

function Decision3_Badges() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Decision 3: Badge / Tag Standard</h2>
        <p className="text-muted-foreground">
          Currently 4+ patterns for badge text. Preview each and pick one universal standard.
        </p>
      </div>

      {/* Current state */}
      <Card className="border-2 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-base">Current State — inconsistent badges across the platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1 text-center">
              <Badge className="text-[10px] h-4 px-1.5">text-[10px] h-4</Badge>
              <p className="text-[9px] text-muted-foreground">TemplateSettings</p>
            </div>
            <div className="space-y-1 text-center">
              <Badge variant="secondary" className="font-normal text-xs">text-xs font-normal</Badge>
              <p className="text-[9px] text-muted-foreground">UserAccount</p>
            </div>
            <div className="space-y-1 text-center">
              <Badge variant="outline" className="text-[10px] h-5 font-normal">text-[10px] h-5</Badge>
              <p className="text-[9px] text-muted-foreground">PostCard role</p>
            </div>
            <div className="space-y-1 text-center">
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">text-[10px] h-5 px-1.5</Badge>
              <p className="text-[9px] text-muted-foreground">UserProfile</p>
            </div>
            <div className="space-y-1 text-center">
              <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-semibold" style={{ fontSize: "10px", fontWeight: 600 }}>10px/600 inline</span>
              <p className="text-[9px] text-muted-foreground">SpaceCard privacy</p>
            </div>
            <div className="space-y-1 text-center">
              <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-semibold" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.02em" }}>11px/600 tracked</span>
              <p className="text-[9px] text-muted-foreground">SpaceHeader variant</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposed options */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-500 ring-2 ring-green-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"><Check className="w-3.5 h-3.5" /></span>
              text-xs (12px) font-medium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Matches Tailwind scale. Slightly larger, more readable.</p>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
              <Badge className="text-xs font-medium">Lead</Badge>
              <Badge variant="secondary" className="text-xs font-medium">Member</Badge>
              <Badge variant="outline" className="text-xs font-medium">Private</Badge>
              <Badge variant="destructive" className="text-xs font-medium">Archived</Badge>
              <Badge variant="secondary" className="text-xs font-medium">3 Active</Badge>
              <Badge variant="outline" className="text-xs font-medium">V2</Badge>
              <Badge variant="outline" className="text-xs font-medium">Innovation</Badge>
              <Badge variant="secondary" className="text-xs font-medium">Whiteboard</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-muted/30 opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">B</span>
              11px font-medium
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">In between. Compact but still legible. Would use text-2xs.</p>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
              <Badge className="font-medium" style={{ fontSize: "11px" }}>Lead</Badge>
              <Badge variant="secondary" className="font-medium" style={{ fontSize: "11px" }}>Member</Badge>
              <Badge variant="outline" className="font-medium" style={{ fontSize: "11px" }}>Private</Badge>
              <Badge variant="destructive" className="font-medium" style={{ fontSize: "11px" }}>Archived</Badge>
              <Badge variant="secondary" className="font-medium" style={{ fontSize: "11px" }}>3 Active</Badge>
              <Badge variant="outline" className="font-medium" style={{ fontSize: "11px" }}>V2</Badge>
              <Badge variant="outline" className="font-medium" style={{ fontSize: "11px" }}>Innovation</Badge>
              <Badge variant="secondary" className="font-medium" style={{ fontSize: "11px" }}>Whiteboard</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-muted/30 opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">C</span>
              10px font-semibold
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Most compact. Bolder weight compensates for small size.</p>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
              <Badge className="font-semibold" style={{ fontSize: "10px" }}>Lead</Badge>
              <Badge variant="secondary" className="font-semibold" style={{ fontSize: "10px" }}>Member</Badge>
              <Badge variant="outline" className="font-semibold" style={{ fontSize: "10px" }}>Private</Badge>
              <Badge variant="destructive" className="font-semibold" style={{ fontSize: "10px" }}>Archived</Badge>
              <Badge variant="secondary" className="font-semibold" style={{ fontSize: "10px" }}>3 Active</Badge>
              <Badge variant="outline" className="font-semibold" style={{ fontSize: "10px" }}>V2</Badge>
              <Badge variant="outline" className="font-semibold" style={{ fontSize: "10px" }}>Innovation</Badge>
              <Badge variant="secondary" className="font-semibold" style={{ fontSize: "10px" }}>Whiteboard</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   DECISION 4: Letter-spacing
   ───────────────────────────────────────────────── */

function Decision4_Tracking() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Decision 4: Letter-Spacing</h2>
        <p className="text-muted-foreground">
          Currently 8+ tracking variants. Collapse to standard Tailwind values only.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current chaos */}
        <Card className="border-2 border-red-500/30 opacity-60">
          <CardHeader>
            <CardTitle className="text-base">Current: 8+ variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              {[
                { label: "tracking-tight", cls: "tracking-tight", text: "Section Heading" },
                { label: "tracking-wider", cls: "tracking-wider", text: "SECTION LABEL" },
                { label: "tracking-widest", cls: "tracking-widest", text: "BRAINSTORMING" },
                { label: "tracking-[0.02em]", style: { letterSpacing: "0.02em" }, text: "V2 BADGE" },
                { label: "tracking-[0.088px]", style: { letterSpacing: "0.088px" }, text: "Dialog text" },
                { label: "tracking-[0.131px]", style: { letterSpacing: "0.131px" }, text: "Source Sans text" },
                { label: "tracking-[0.343px]", style: { letterSpacing: "0.343px" }, text: "BUTTON LABEL" },
                { label: "tracking-[0.4px]", style: { letterSpacing: "0.4px" }, text: "Regular text" },
                { label: "letterSpacing: -0.02em", style: { letterSpacing: "-0.02em" }, text: "Analytics Heading" },
              ].map(({ label, cls, style, text }) => (
                <div key={label} className="flex items-center gap-3">
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded w-40 shrink-0 font-mono">{label}</code>
                  <span className={`text-sm font-medium ${cls || ""}`} style={style}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Proposed: 3 values — CHOSEN */}
        <Card className="border-2 border-green-500 ring-2 ring-green-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"><Check className="w-3.5 h-3.5" /></span>
              Proposed: 3 values only
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">tracking-tight (-0.025em)</code>
                <p className="text-2xl font-semibold tracking-tight">Section Heading</p>
                <p className="text-xs text-muted-foreground">Use for: large headings (text-xl and above)</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">tracking-normal (0)</code>
                <p className="text-sm font-medium tracking-normal">Body text, buttons, labels, nav items</p>
                <p className="text-xs text-muted-foreground">Use for: everything else (default, no class needed)</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">tracking-wider (0.05em)</code>
                <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">SECTION LABEL</p>
                <p className="text-xs text-muted-foreground">Use for: uppercase labels and overlines only</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   DECISION 5: Font weight mapping
   ───────────────────────────────────────────────── */

function Decision5_Weights() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Decision 5: Weight Strategy</h2>
        <p className="text-muted-foreground">
          Currently font-semibold (600) and font-bold (700) are used interchangeably for headings.
          Pick one rule.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-2 border-muted/30 opacity-60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">A</span>
              3-weight system (400 / 500 / 600)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Clean separation. Body=400, interactive=500, headings=600.</p>
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <div className="text-2xl font-semibold">Section Heading (600)</div>
              <div className="text-lg font-semibold">Card Title (600)</div>
              <div className="text-sm font-medium">Button / Tab / Label (500)</div>
              <div className="text-sm font-normal">Body text and descriptions (400)</div>
              <div className="text-xs font-normal text-muted-foreground">Metadata, timestamps (400)</div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Reserve 700+ for user content only (bold in markdown)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 ring-2 ring-green-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"><Check className="w-3.5 h-3.5" /></span>
              4-weight system (400 / 500 / 600 / 700)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">More range. Page titles get 700, section headings get 600.</p>
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <div className="text-2xl font-bold">Page Title (700)</div>
              <div className="text-xl font-semibold">Section Heading (600)</div>
              <div className="text-lg font-semibold">Card Title (600)</div>
              <div className="text-sm font-medium">Button / Tab / Label (500)</div>
              <div className="text-sm font-normal">Body text and descriptions (400)</div>
              <div className="text-xs font-normal text-muted-foreground">Metadata, timestamps (400)</div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> More visual hierarchy between page title and section heading</p>
              <p className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" /> 700 also used in user markdown bold — potential collision</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   FINALIZED TOKEN TABLE (reflects all decisions)
   ───────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  "user-input": "bg-blue-500",
  interactive: "bg-green-500",
  system: "bg-purple-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  "user-input": "User Input",
  interactive: "Interactive",
  system: "System / Platform",
};

interface TokenDef {
  name: string;
  tw: string;
  size: string;
  weight: number;
  tracking: string;
  category: "user-input" | "interactive" | "system";
  usedFor: string[];
  note?: string;
}

const TOKENS: TokenDef[] = [
  // ── System / Platform ──
  {
    name: "Page Title",
    tw: "text-3xl font-bold tracking-tight",
    size: "30px",
    weight: 700,
    tracking: "tight",
    category: "system",
    usedFor: [
      "Dashboard page title",
      "\"Browse Spaces\" page heading",
      "Admin page title",
      "\"Template Library\" heading",
      "User profile name (account page)",
    ],
  },
  {
    name: "Section Heading",
    tw: "text-2xl font-semibold tracking-tight",
    size: "24px",
    weight: 600,
    tracking: "tight",
    category: "system",
    usedFor: [
      "\"About\" section in settings pages",
      "\"Templates\" section header",
      "\"Hosted Spaces\" section",
      "Design system page sections",
      "Analytics section dividers",
    ],
  },
  {
    name: "Card / Dialog Title",
    tw: "text-lg font-semibold",
    size: "18px",
    weight: 600,
    tracking: "normal",
    category: "system",
    usedFor: [
      "Dialog / modal title bar",
      "Post card title (e.g. \"Carbon Capture Framework\")",
      "Template card name in library",
      "Space card name on dashboard",
      "\"Recent Activity\" section in feed",
    ],
  },
  {
    name: "Subsection",
    tw: "text-base font-semibold",
    size: "16px",
    weight: 600,
    tracking: "normal",
    category: "system",
    usedFor: [
      "Expandable section title (\"Callout Templates (3)\")",
      "Knowledge base list group headers",
      "Member list group headers",
      "Notification group header",
      "Chat conversation name",
    ],
  },
  {
    name: "Body",
    tw: "text-sm",
    size: "14px",
    weight: 400,
    tracking: "normal",
    category: "system",
    usedFor: [
      "Card descriptions / summaries",
      "Dialog body text",
      "Settings help text / explanations",
      "Activity feed item descriptions",
      "Table cell text",
    ],
  },
  {
    name: "Metadata",
    tw: "text-xs",
    size: "12px",
    weight: 400,
    tracking: "normal",
    category: "system",
    usedFor: [
      "Timestamps (\"3 min ago\", \"May 12\")",
      "Member counts (\"5 members\", \"11 subspaces\")",
      "\"In: Parent Space\" breadcrumb on cards",
      "Message preview snippets",
      "Notification secondary text",
      "Table captions",
    ],
  },
  {
    name: "Overline",
    tw: "text-[11px] font-medium uppercase tracking-wide",
    size: "11px",
    weight: 500,
    tracking: "wide",
    category: "system",
    usedFor: [
      "Sidebar section labels (\"MY SPACES\", \"MESSAGES\")",
      "Settings group labels (\"PACK IDENTITY\", \"VISIBILITY\")",
      "Form section dividers (\"GENERAL\", \"ADVANCED\")",
    ],
  },

  // ── Interactive ──
  {
    name: "Interactive",
    tw: "text-sm font-medium",
    size: "14px",
    weight: 500,
    tracking: "normal",
    category: "interactive",
    usedFor: [
      "Button labels (\"Join Space\", \"Save\", \"Cancel\")",
      "Tab triggers (\"Overview\", \"Community\", \"Settings\")",
      "Sidebar navigation items",
      "Dropdown menu items (\"View Profile\", \"Edit\")",
      "Form labels (\"Space Name\", \"Description\")",
      "Breadcrumb links",
      "Author name / byline on cards",
      "Table column headers",
      "Accordion triggers",
      "\"Explore all Spaces\" link text",
    ],
  },
  {
    name: "Badge / Tag",
    tw: "text-xs font-medium",
    size: "12px",
    weight: 500,
    tracking: "normal",
    category: "interactive",
    usedFor: [
      "Role badges (\"Lead\", \"Member\", \"Admin\")",
      "Status badges (\"Active\", \"Archived\")",
      "Privacy badges (\"Private\", \"Public\")",
      "Tag chips on posts / spaces (\"Innovation\", \"Climate\")",
      "Version indicators (\"V2\", \"V3\")",
      "Count badges (\"3 Active\")",
      "Post type labels (\"Whiteboard\", \"Document\")",
      "Template category chips",
    ],
  },

  // ── User Input / Markdown ──
  {
    name: "Prose H1",
    tw: "text-2xl font-bold tracking-tight",
    size: "24px",
    weight: 700,
    tracking: "tight",
    category: "user-input",
    note: "Inside prose wrapper. Scaled down from system Page Title (30px) to avoid confusion with platform chrome.",
    usedFor: [
      "User-authored # heading in post body",
      "Knowledge base article main heading",
      "Space description H1 (editor output)",
    ],
  },
  {
    name: "Prose H2",
    tw: "text-xl font-semibold tracking-tight",
    size: "20px",
    weight: 600,
    tracking: "tight",
    category: "user-input",
    note: "Inside prose wrapper. Maps to ## in markdown.",
    usedFor: [
      "User-authored ## heading in post body",
      "Knowledge base article section heading",
      "Update/announcement section heading",
    ],
  },
  {
    name: "Prose H3",
    tw: "text-lg font-semibold",
    size: "18px",
    weight: 600,
    tracking: "normal",
    category: "user-input",
    note: "Inside prose wrapper. Maps to ### in markdown.",
    usedFor: [
      "User-authored ### heading in post body",
      "Knowledge base subsection heading",
      "Discussion/comment heading",
    ],
  },
  {
    name: "Body Large",
    tw: "text-base",
    size: "16px",
    weight: 400,
    tracking: "normal",
    category: "user-input",
    note: "Default prose paragraph text, also used for text inputs and textareas.",
    usedFor: [
      "Post body / prose <p> content",
      "Text input field values",
      "Textarea values",
      "Markdown paragraph text",
      "Comment body text",
    ],
  },
  {
    name: "Prose Small",
    tw: "text-sm",
    size: "14px",
    weight: 400,
    tracking: "normal",
    category: "user-input",
    note: "Prose secondary text. Same size as system Body but contextually different — this is user content, not platform UI.",
    usedFor: [
      "Blockquote text (rendered slightly smaller)",
      "Footnotes / captions authored by user",
      "Inline help text typed by user",
    ],
  },
  {
    name: "Prose Code",
    tw: "text-sm font-mono",
    size: "14px",
    weight: 400,
    tracking: "normal",
    category: "user-input",
    note: "Monospace font for code blocks and inline code. Uses font-mono (JetBrains Mono / system monospace).",
    usedFor: [
      "Inline code (`variable`)",
      "Code blocks (```js ... ```)",
      "API references typed by user",
    ],
  },
  {
    name: "Prose Bold",
    tw: "font-semibold",
    size: "inherit",
    weight: 600,
    tracking: "normal",
    category: "user-input",
    note: "Weight-only modifier applied to <strong> / **text** inside prose. Inherits parent size.",
    usedFor: [
      "**Bold text** emphasis in posts",
      "<strong> in user-authored HTML",
      "Key terms highlighted by authors",
    ],
  },
  {
    name: "Prose Italic",
    tw: "italic",
    size: "inherit",
    weight: 400,
    tracking: "normal",
    category: "user-input",
    note: "Style-only modifier applied to <em> / *text* inside prose. Inherits parent size and weight.",
    usedFor: [
      "*Italic text* emphasis in posts",
      "Subtitles / attributions",
      "Foreign terms or definitions",
    ],
  },
];

function ProposedTokenTable() {
  const categories = ["system", "interactive", "user-input"] as const;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Finalized Token Table</h2>
        <p className="text-muted-foreground max-w-3xl">
          Based on your decisions: <strong>B</strong> round to 12px, <strong>B</strong> Tailwind classes,{" "}
          <strong>A</strong> text-xs font-medium badges, <strong>3 tracking values</strong>,{" "}
          <strong>B</strong> 4-weight system. Expanded with user-input markdown/prose tokens
          covering headings, body, code, and inline emphasis — {TOKENS.length} tokens total.
        </p>
      </div>

      {categories.map((cat) => {
        const catTokens = TOKENS.filter((t) => t.category === cat);
        return (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat]}`} />
                {CATEGORY_LABELS[cat]}
                <Badge variant="secondary" className="text-xs font-normal ml-1">
                  {catTokens.length} tokens
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 pr-4 font-medium text-muted-foreground w-[130px]">Token</th>
                      <th className="py-2 pr-4 font-medium text-muted-foreground w-[220px]">Tailwind Classes</th>
                      <th className="py-2 pr-4 font-medium text-muted-foreground w-[60px]">Size</th>
                      <th className="py-2 pr-4 font-medium text-muted-foreground w-[60px]">Weight</th>
                      <th className="py-2 pr-4 font-medium text-muted-foreground w-[60px]">Tracking</th>
                      <th className="py-2 pr-4 font-medium text-muted-foreground w-[150px]">Live Preview</th>
                      <th className="py-2 font-medium text-muted-foreground">Used For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catTokens.map((t) => (
                      <tr key={t.name} className="border-b border-border/50 align-top">
                        <td className="py-3 pr-4 font-medium">{t.name}</td>
                        <td className="py-3 pr-4">
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono leading-relaxed">
                            {t.tw}
                          </code>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{t.size}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{t.weight}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{t.tracking}</td>
                        <td className="py-3 pr-4">
                          <span className={t.tw}>
                            {t.name === "Overline" ? "SAMPLE LABEL" : t.name === "Prose Code" ? "const x = 42;" : t.name === "Prose Bold" ? "Bold emphasis" : t.name === "Prose Italic" ? "Italic emphasis" : "Sample text"}
                          </span>
                        </td>
                        <td className="py-3">
                          <ul className="space-y-0.5">
                            {t.usedFor.map((use, i) => (
                              <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                                • {use}
                              </li>
                            ))}
                          </ul>
                          {t.note && (
                            <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{t.note}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Full-context preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4" /> Full Context Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl space-y-6 p-6 bg-muted/20 rounded-lg border">
            {/* Simulated card with all tokens */}
            <div className="text-3xl font-bold tracking-tight">Climate Action Hub</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">OVERVIEW</div>
            <div className="text-2xl font-semibold tracking-tight">About this Space</div>
            <div className="text-sm text-foreground">
              A collaborative space dedicated to exploring innovative climate solutions.
              Members share research, case studies, and engage in structured dialogue.
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-xs font-medium">Innovation</Badge>
              <Badge variant="secondary" className="text-xs font-medium">Climate</Badge>
              <Badge variant="outline" className="text-xs font-medium">Private</Badge>
            </div>
            <Separator />
            <div className="text-lg font-semibold">Recent Activity</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Sarah Chen</span>
                  <span className="text-xs text-muted-foreground ml-2">posted a document</span>
                </div>
                <span className="text-xs text-muted-foreground">3 min ago</span>
              </div>
              <div className="text-base font-semibold">Carbon Capture Framework v2</div>
              <div className="text-sm text-muted-foreground">
                This framework outlines our approach to evaluating new carbon capture technologies...
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="text-sm font-medium">Join Space</Button>
              <Button size="sm" variant="outline" className="text-sm font-medium">Learn More</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Prose / Markdown Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4" /> Live Prose Preview — User-Authored Content
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This simulates how user-authored markdown/rich-text content renders
            inside a <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">prose</code> wrapper.
            All tokens from the <strong>User Input</strong> category are visible here.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: rendered prose */}
            <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-muted/20 rounded-lg border">
              <h1>Carbon Capture Framework</h1>
              <p>
                This framework outlines our approach to evaluating new carbon capture
                technologies across the <strong>Green Energy Space</strong> ecosystem. It builds on
                <em> six months of collaborative research</em> from field builders in the Netherlands and beyond.
              </p>
              <h2>Methodology Overview</h2>
              <p>
                Each technology is assessed against three criteria: scalability, cost-effectiveness,
                and environmental impact. We use a <strong>weighted scoring model</strong> to compare options.
              </p>
              <h3>Data Sources</h3>
              <ul>
                <li>Academic publications (2023–2025)</li>
                <li>Industry benchmarks from the <em>Global CCS Institute</em></li>
                <li>Field data from pilot programs in Rotterdam and Groningen</li>
              </ul>
              <blockquote>
                <p>"The most promising approaches combine biomass energy with geological storage."</p>
              </blockquote>
              <p>
                For implementation details, see the <code>scoring-model.xlsx</code> spreadsheet.
                Below is a snippet from our evaluation script:
              </p>
              <pre><code>{`function evaluateTech(tech) {
  const score = tech.scalability * 0.4
    + tech.costEfficiency * 0.35
    + tech.envImpact * 0.25;
  return { name: tech.name, score };
}`}</code></pre>
              <h3>Next Steps</h3>
              <ol>
                <li>Finalize scoring weights with the advisory board</li>
                <li>Run the model against Q1 2026 data</li>
                <li>Publish findings in the knowledge base</li>
              </ol>
            </div>

            {/* Right: token annotations */}
            <div className="space-y-4 text-sm">
              <h3 className="text-base font-semibold">Token Mapping</h3>
              <p className="text-muted-foreground text-sm">
                How each element in the prose maps to a user-input token:
              </p>
              <div className="space-y-2">
                {[
                  { el: "<h1>", token: "Prose H1", tw: "text-2xl font-bold tracking-tight", note: "24px — deliberately smaller than system Page Title (30px) so users can't override the page header visually" },
                  { el: "<h2>", token: "Prose H2", tw: "text-xl font-semibold tracking-tight", note: "20px — matches production h5 semantic level" },
                  { el: "<h3>", token: "Prose H3", tw: "text-lg font-semibold", note: "18px — same as Card Title, works well for sub-sections" },
                  { el: "<p>", token: "Body Large", tw: "text-base", note: "16px — the default reading paragraph size" },
                  { el: "<strong>", token: "Prose Bold", tw: "font-semibold", note: "600 weight — inherits parent size" },
                  { el: "<em>", token: "Prose Italic", tw: "italic", note: "Style modifier only — inherits everything else" },
                  { el: "<code>", token: "Prose Code", tw: "text-sm font-mono", note: "14px monospace — slightly smaller than body" },
                  { el: "<pre>", token: "Prose Code", tw: "text-sm font-mono", note: "Block code uses same token in a styled container" },
                  { el: "<blockquote>", token: "Prose Small", tw: "text-sm", note: "14px — visually de-emphasized with left border" },
                  { el: "<ul>/<ol>", token: "Body Large", tw: "text-base", note: "Lists inherit the paragraph token" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border/30">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono shrink-0 w-24">{item.el}</code>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.token}</span>
                        <code className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">{item.tw}</code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40">
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Production comparison</h4>
                <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                  Production uses <strong>Montserrat</strong> for h1–h4 and <strong>Source Sans Pro</strong> for h5–h6 and body.
                  The redesign unifies everything under <strong>Inter</strong>, using size and weight
                  differentiation instead of font-family switching. Prose headings are intentionally
                  scaled down so user content never visually overrides platform chrome.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────── */

export default function TypographyDecisionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/typography"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Typography System
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <Columns2 className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Typography Decisions</h1>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">5 / 5 decisions made</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        <section>
          <p className="text-muted-foreground max-w-3xl">
            All 5 typography decisions have been made. The chosen options are highlighted in green below.
            Scroll to the bottom for the finalized token table with all usage mappings.
          </p>
        </section>

        <Decision1_TextSize />
        <Separator className="my-4" />
        <Decision2_Headings />
        <Separator className="my-4" />
        <Decision3_Badges />
        <Separator className="my-4" />
        <Decision4_Tracking />
        <Separator className="my-4" />
        <Decision5_Weights />
        <Separator className="my-4" />
        <ProposedTokenTable />
      </main>
    </div>
  );
}
