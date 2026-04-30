import { Outlet, useLocation } from "react-router";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";

export function MainLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {isDashboard && <Sidebar className="hidden md:flex" />}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}