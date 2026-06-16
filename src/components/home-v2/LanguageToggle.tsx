import { useTranslation } from "react-i18next";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || "nl").startsWith("en") ? "en" : "nl";
  const set = (l: "nl" | "en") => i18n.changeLanguage(l);

  return (
    <div className={`inline-flex items-center gap-1 text-xs font-medium tracking-wider ${className}`}>
      <button
        onClick={() => set("nl")}
        className={`px-2 py-1 rounded transition-colors ${lang === "nl" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-label="Nederlands"
      >
        NL
      </button>
      <span className="text-muted-foreground/40">|</span>
      <button
        onClick={() => set("en")}
        className={`px-2 py-1 rounded transition-colors ${lang === "en" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
