import { cn } from "@/lib/utils";
import { useLanguage, LANGUAGES } from "@/app/contexts/LanguageContext";
import AlkemioSymbolSquare from "@/imports/AlkemioSymbolSquare";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export function Footer({ className }: { className?: string }) {
  const { t, currentLanguage, language, setLanguage } = useLanguage();

  return (
    <footer
      className={cn("py-8 px-6 mt-auto", className)}
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--card)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Copyright */}
        <div
          className="flex items-center gap-2"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
          }}
        >
          <span>© 2026 Alkemio B.V.</span>
        </div>

        {/* Links + centered logo */}
        <div
          className="flex items-center gap-6"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
          }}
        >
          <a href="#" className="hover:text-foreground transition-colors">
            {t("footer.terms")}
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            {t("footer.privacy")}
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Security
          </a>

          {/* Small centered Alkemio logo */}
          <div className="w-5 h-5 opacity-40">
            <AlkemioSymbolSquare />
          </div>

          <a href="#" className="hover:text-foreground transition-colors">
            {t("footer.support")}
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            About
          </a>
        </div>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent transition-colors"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
              }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLanguage.nativeLabel}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "flex items-center justify-between cursor-pointer",
                  language === lang.code && "bg-accent"
                )}
              >
                <span style={{ fontSize: "var(--text-sm)" }}>
                  {lang.nativeLabel}
                </span>
                {language === lang.code && (
                  <Check
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--primary)" }}
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </footer>
  );
}
