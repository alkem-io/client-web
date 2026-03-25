import { Outlet } from "react-router";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";

export function SpaceLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      {/* Page content — full-width, no sidebar */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
