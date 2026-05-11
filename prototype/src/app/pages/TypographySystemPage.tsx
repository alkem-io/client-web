import React from "react";
import { Link } from "react-router";
import { ArrowLeft, Type, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";

/* ─── Typography Token Data ─── */

interface TypographyToken {
  name: string;
  element: string;
  size: string;
  sizePx: number;
  weight: number;
  weightLabel: string;
  lineHeight: string;
  fontFamily: string;
  usage: string;
  category: "platform" | "user-content";
}

const platformTokens: TypographyToken[] = [
  {
    name: "Display / H1",
    element: "h1",
    size: "48px",
    sizePx: 48,
    weight: 800,
    weightLabel: "ExtraBold",
    lineHeight: "1.0",
    fontFamily: "Inter",
    usage: "Page titles, hero sections",
    category: "platform",
  },
  {
    name: "Heading 2",
    element: "h2",
    size: "30px",
    sizePx: 30,
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "1.2",
    fontFamily: "Inter",
    usage: "Section headings, card titles",
    category: "platform",
  },
  {
    name: "Heading 3",
    element: "h3",
    size: "24px",
    sizePx: 24,
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "1.33",
    fontFamily: "Inter",
    usage: "Sub-section headings, dialog titles",
    category: "platform",
  },
  {
    name: "Heading 4",
    element: "h4",
    size: "20px",
    sizePx: 20,
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "1.4",
    fontFamily: "Inter",
    usage: "Card headings, sidebar titles",
    category: "platform",
  },
  {
    name: "Body",
    element: "p",
    size: "16px",
    sizePx: 16,
    weight: 400,
    weightLabel: "Regular",
    lineHeight: "1.75",
    fontFamily: "Inter",
    usage: "Paragraph text, descriptions",
    category: "platform",
  },
  {
    name: "Body Small / Label",
    element: "label",
    size: "14px",
    sizePx: 14,
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "1.43",
    fontFamily: "Inter",
    usage: "Form labels, captions, metadata",
    category: "platform",
  },
  {
    name: "Button",
    element: "button",
    size: "16px",
    sizePx: 16,
    weight: 500,
    weightLabel: "Medium",
    lineHeight: "1.5",
    fontFamily: "Inter",
    usage: "Button labels, CTAs",
    category: "platform",
  },
  {
    name: "Input",
    element: "input",
    size: "16px",
    sizePx: 16,
    weight: 400,
    weightLabel: "Regular",
    lineHeight: "1.5",
    fontFamily: "Inter",
    usage: "Form inputs, text fields",
    category: "platform",
  },
];

const userContentTokens: TypographyToken[] = [
  {
    name: "User Title",
    element: "h2",
    size: "30px",
    sizePx: 30,
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "1.2",
    fontFamily: "Inter",
    usage: "Space names, post titles",
    category: "user-content",
  },
  {
    name: "User Subtitle",
    element: "h3",
    size: "24px",
    sizePx: 24,
    weight: 600,
    weightLabel: "SemiBold",
    lineHeight: "1.33",
    fontFamily: "Inter",
    usage: "Subspace names, section headers in posts",
    category: "user-content",
  },
  {
    name: "User Body",
    element: "p",
    size: "16px",
    sizePx: 16,
    weight: 400,
    weightLabel: "Regular",
    lineHeight: "1.75",
    fontFamily: "Inter",
    usage: "Post content, descriptions, comments",
    category: "user-content",
  },
  {
    name: "User Caption",
    element: "span",
    size: "14px",
    sizePx: 14,
    weight: 400,
    weightLabel: "Regular",
    lineHeight: "1.43",
    fontFamily: "Inter",
    usage: "Timestamps, author names, tags",
    category: "user-content",
  },
  {
    name: "User Small",
    element: "span",
    size: "12px",
    sizePx: 12,
    weight: 400,
    weightLabel: "Regular",
    lineHeight: "1.5",
    fontFamily: "Inter",
    usage: "Badge text, counters, fine print",
    category: "user-content",
  },
];

/* ─── Scale Visualization ─── */

function TypeScaleBar({ token }: { token: TypographyToken }) {
  const maxSize = 48;
  const widthPercent = (token.sizePx / maxSize) * 100;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="w-28 shrink-0">
        <p className="text-sm font-medium text-foreground">{token.name}</p>
        <p className="text-xs text-muted-foreground">&lt;{token.element}&gt;</p>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="h-6 rounded bg-primary/10 border border-primary/20 flex items-center px-2"
          style={{ width: `${Math.max(widthPercent, 20)}%` }}
        >
          <span className="text-xs text-primary font-medium truncate">
            {token.size} / {token.weightLabel}
          </span>
        </div>
      </div>
      <div className="w-16 text-right shrink-0">
        <span className="text-xs text-muted-foreground">LH {token.lineHeight}</span>
      </div>
    </div>
  );
}

/* ─── Live Preview ─── */

function TypePreview({ token }: { token: TypographyToken }) {
  return (
    <div className="py-4 border-b border-border/50 last:border-0">
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {token.element}
          </Badge>
          <span className="text-sm font-medium">{token.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {token.size} · {token.weightLabel} ({token.weight}) · {token.fontFamily}
        </span>
      </div>
      <div
        style={{
          fontSize: token.size,
          fontWeight: token.weight,
          lineHeight: token.lineHeight,
          fontFamily: `'${token.fontFamily}', sans-serif`,
        }}
        className="text-foreground"
      >
        The quick brown fox jumps over the lazy dog
      </div>
      <p className="text-xs text-muted-foreground mt-1">{token.usage}</p>
    </div>
  );
}

/* ─── Spec Table ─── */

function TypeTable({ tokens }: { tokens: TypographyToken[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-4 font-medium text-muted-foreground">Name</th>
            <th className="py-2 pr-4 font-medium text-muted-foreground">Element</th>
            <th className="py-2 pr-4 font-medium text-muted-foreground">Font</th>
            <th className="py-2 pr-4 font-medium text-muted-foreground">Size</th>
            <th className="py-2 pr-4 font-medium text-muted-foreground">Weight</th>
            <th className="py-2 pr-4 font-medium text-muted-foreground">Line Height</th>
            <th className="py-2 font-medium text-muted-foreground">Usage</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.name} className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium">{token.name}</td>
              <td className="py-2 pr-4">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{token.element}</code>
              </td>
              <td className="py-2 pr-4">{token.fontFamily}</td>
              <td className="py-2 pr-4">{token.size}</td>
              <td className="py-2 pr-4">
                {token.weight} <span className="text-muted-foreground">({token.weightLabel})</span>
              </td>
              <td className="py-2 pr-4">{token.lineHeight}</td>
              <td className="py-2 text-muted-foreground">{token.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Page ─── */

export default function TypographySystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/design-system"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Design System
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Typography System</h1>
            </div>
          </div>
          <Badge variant="secondary">Inter · {platformTokens.length + userContentTokens.length} styles</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Intro */}
        <section>
          <p className="text-muted-foreground max-w-2xl">
            A complete inventory of all typography styles used across the Alkemio platform.
            This page documents platform UI text and user-generated content styles, ensuring
            consistency in size, weight, and hierarchy.
          </p>
        </section>

        {/* Type Scale Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Type Scale</h2>
          <Card>
            <CardContent className="pt-6">
              {[...platformTokens].sort((a, b) => b.sizePx - a.sizePx).map((token) => (
                <TypeScaleBar key={token.name} token={token} />
              ))}
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Detailed view with tabs */}
        <Tabs defaultValue="platform" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Style Reference</h2>
            <TabsList>
              <TabsTrigger value="platform">Platform UI</TabsTrigger>
              <TabsTrigger value="user-content">User Content</TabsTrigger>
              <TabsTrigger value="all">All Styles</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {platformTokens.map((token) => (
                  <TypePreview key={token.name} token={token} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <TypeTable tokens={platformTokens} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userContentTokens.map((token) => (
                  <TypePreview key={token.name} token={token} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <TypeTable tokens={userContentTokens} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Typography Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <TypeTable tokens={[...platformTokens, ...userContentTokens]} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Design Decisions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Design Decisions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Font Family</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Inter</p>
                Single typeface across all UI and content. Optimized for screen readability
                with optical sizing and variable weight support (300–800).
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scale Ratio</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Major Third (~1.25×)</p>
                Sizes progress: 12 → 14 → 16 → 20 → 24 → 30 → 48px.
                Provides clear hierarchy without extreme jumps.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weight Strategy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">3 weights max</p>
                Regular (400) for body, Medium (500) for interactive/labels,
                SemiBold (600) for headings. ExtraBold (800) reserved for page titles only.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
