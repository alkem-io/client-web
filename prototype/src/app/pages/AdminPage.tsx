import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  Shield,
  Users,
  Settings,
  BarChart3,
  Globe,
  Layout,
  Bell,
  FileText,
  Database,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";

const ADMIN_SECTIONS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "spaces", label: "Spaces", icon: Globe },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "templates", label: "Templates", icon: Layout },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "audit-log", label: "Audit Log", icon: FileText },
  { id: "platform", label: "Platform Settings", icon: Settings },
];

const PLATFORM_STATS = [
  { label: "Total Users", value: "2,847", icon: Users },
  { label: "Active Spaces", value: "156", icon: Globe },
];

const RECENT_ACTIVITY = [
  { user: "Sarah Chen", action: "Created space", target: "Climate Action Network", time: "2h ago" },
  { user: "David Kim", action: "Updated role", target: "Admin → Super Admin", time: "4h ago" },
  { user: "System", action: "Backup completed", target: "Database snapshot v2.4", time: "6h ago" },
  { user: "Emily Davis", action: "Invited 12 users to", target: "Sustainable Futures", time: "1d ago" },
  { user: "Anna Martinez", action: "Archived space", target: "Legacy Projects", time: "2d ago" },
];

export default function AdminPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const activeSection = section || "overview";

  return (
    <div className="flex min-h-[calc(100vh-128px)]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 py-6 px-3"
        style={{
          borderRight: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <div className="flex items-center gap-2 px-3 mb-6">
          <Shield className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            Administration
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {ADMIN_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(s.id === "overview" ? "/admin" : `/admin/${s.id}`)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors",
                activeSection === s.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: activeSection === s.id ? 600 : ("var(--font-weight-normal)" as any),
              }}
            >
              <s.icon className="w-4 h-4 shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeSection === "overview" ? (
            <>
              <div className="mb-8">
                <h1
                  style={{
                    fontSize: "var(--text-2xl)",
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  Platform Overview
                </h1>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                    marginTop: 4,
                  }}
                >
                  Monitor and manage your Alkemio platform
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {PLATFORM_STATS.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-md flex items-center justify-center"
                          style={{
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                            opacity: 0.9,
                          }}
                        >
                          <stat.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: "var(--text-2xl)",
                          fontWeight: 700,
                          color: "var(--foreground)",
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.value}
                      </p>
                      <p
                        style={{
                          fontSize: "var(--text-sm)",
                          color: "var(--muted-foreground)",
                          marginTop: 2,
                        }}
                      >
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h2
                      style={{
                        fontSize: "var(--text-base)",
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      Recent Activity
                    </h2>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      View all
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {RECENT_ACTIVITY.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-accent/50"
                      style={{
                        borderBottom:
                          i < RECENT_ACTIVITY.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                          opacity: 0.85,
                        }}
                      >
                        <span style={{ fontSize: "11px", fontWeight: 700 }}>
                          {item.user.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}>
                          <span style={{ fontWeight: 600 }}>{item.user}</span>{" "}
                          <span style={{ color: "var(--muted-foreground)" }}>{item.action}</span>{" "}
                          <span style={{ fontWeight: 500 }}>{item.target}</span>
                        </p>
                      </div>
                      <span
                        className="shrink-0"
                        style={{
                          fontSize: "12px",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {item.time}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {[
                  { label: "Manage Users", desc: "Invite, suspend, or remove users", icon: Users, section: "users" },
                  { label: "Roles & Permissions", desc: "Configure access control", icon: Lock, section: "roles" },
                  { label: "Platform Settings", desc: "Branding, domains, and configuration", icon: Settings, section: "platform" },
                ].map((action) => (
                  <button
                    key={action.section}
                    onClick={() => navigate(`/admin/${action.section}`)}
                    className="group flex items-start gap-4 p-5 rounded-md text-left transition-colors"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        background: "var(--secondary)",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className="group-hover:text-primary transition-colors"
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          color: "var(--foreground)",
                        }}
                      >
                        {action.label}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--muted-foreground)",
                          marginTop: 2,
                        }}
                      >
                        {action.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Placeholder for other admin sections */
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--muted)" }}
              >
                {(() => {
                  const sec = ADMIN_SECTIONS.find((s) => s.id === activeSection);
                  const Icon = sec?.icon || Settings;
                  return <Icon className="w-7 h-7" style={{ color: "var(--muted-foreground)" }} />;
                })()}
              </div>
              <h2
                className="capitalize"
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: 600,
                  color: "var(--foreground)",
                }}
              >
                {ADMIN_SECTIONS.find((s) => s.id === activeSection)?.label || activeSection}
              </h2>
              <p
                className="max-w-sm text-center mt-2"
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--muted-foreground)",
                }}
              >
                This administration section is under development. Check back soon for full management capabilities.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => navigate("/admin")}>
                Back to Overview
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
