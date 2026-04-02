import { Link } from "react-router";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function NotFoundPage() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{
        minHeight: "calc(100vh - 200px)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Large 404 */}
      <div
        className="select-none"
        style={{
          fontSize: "clamp(80px, 15vw, 160px)",
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--muted-foreground)",
          opacity: 0.15,
        }}
      >
        404
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
          color: "var(--foreground)",
          marginTop: "-0.25em",
        }}
      >
        Page not found
      </h1>

      {/* Description */}
      <p
        className="max-w-md"
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--muted-foreground)",
          marginTop: 12,
          lineHeight: 1.6,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the URL or head
        back to the dashboard.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8">
        <Button variant="outline" asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/spaces">
            <Search className="w-4 h-4 mr-2" />
            Browse Spaces
          </Link>
        </Button>
      </div>

      <button
        onClick={() => window.history.back()}
        className="mt-4 flex items-center gap-1.5 transition-colors"
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--muted-foreground)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Go back
      </button>
    </div>
  );
}
