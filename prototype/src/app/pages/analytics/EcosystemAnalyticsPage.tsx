import React, { useState } from "react";
import { AnalyticsLogin } from "@/app/components/analytics/AnalyticsLogin";
import { AnalyticsSpaceSelector } from "@/app/components/analytics/AnalyticsSpaceSelector";
import { AnalyticsGraphExplorer } from "@/app/components/analytics/AnalyticsGraphExplorer";

type AnalyticsView = "login" | "selection" | "explorer";

export default function EcosystemAnalyticsPage() {
  // In a real app, we'd check auth state here. 
  // For prototype, we default to login screen.
  const [view, setView] = useState<AnalyticsView>("login");
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);

  const handleLogin = () => {
    setView("selection");
  };

  const handleSelectionComplete = (ids: string[]) => {
    setSelectedSpaceIds(ids);
    setView("explorer");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {view === "login" && <AnalyticsLogin onLogin={handleLogin} />}
      {view === "selection" && <AnalyticsSpaceSelector onGenerate={handleSelectionComplete} />}
      {view === "explorer" && <AnalyticsGraphExplorer selectedSpaceIds={selectedSpaceIds} />}
    </div>
  );
}
