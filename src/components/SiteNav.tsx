import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import Logo from "@/components/ui/logo";

type Lang = "nl" | "en";

const copy = {
  nl: {
    services: "Diensten",
    products: "Producten",
    about: "Over ons",
    login: "Inloggen",
    cta: "Plan een kennismaking",
  },
  en: {
    services: "Services",
    products: "Products",
    about: "About us",
    login: "Log in",
    cta: "Schedule a meeting",
  },
};

const servicesItems = ["AI Agent", "AI Automation", "Custom AI Development"];

interface SiteNavProps {
  onCtaClick?: () => void;
}

export function SiteNav({ onCtaClick }: SiteNavProps) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "nl";
    return (localStorage.getItem("site-lang") as Lang) || "nl";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("site-lang", lang);
  }, [lang]);

  const t = copy[lang];

  const productsItems: { label: string; to?: string }[] = [
    { label: "SOAP", to: "/platform-overview" },
    { label: "Recruitment AI" },
    { label: "Confidence AI" },
  ];

  const navItemClass =
    "text-foreground/80 font-now font-medium text-sm";
  const interactiveClass = "hover:text-foreground transition-colors cursor-pointer";

  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between gap-4">
        <Link to="/" aria-label="20/20 home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Diensten dropdown (hover) */}
          <div className="relative group">
            <span className={`${navItemClass} ${interactiveClass} inline-flex items-center gap-1`}>
              {t.services}
              <ChevronDown className="h-4 w-4" />
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="bg-white rounded-xl shadow-lg border border-border min-w-[240px] py-2">
                {servicesItems.map((item) => (
                  <div
                    key={item}
                    className="px-4 py-2 text-sm font-now font-medium text-foreground/80 select-none"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Producten dropdown (hover) */}
          <div className="relative group">
            <span className={`${navItemClass} ${interactiveClass} inline-flex items-center gap-1`}>
              {t.products}
              <ChevronDown className="h-4 w-4" />
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="bg-white rounded-xl shadow-lg border border-border min-w-[240px] py-2">
                {productsItems.map((item) =>
                  item.to ? (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block px-4 py-2 text-sm font-now font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div
                      key={item.label}
                      className="px-4 py-2 text-sm font-now font-medium text-foreground/80 select-none"
                    >
                      {item.label}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Over ons (not clickable) */}
          <span className={navItemClass}>{t.about}</span>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <a
            href="https://www.twentytwentysolutions.io/auth"
            className={`${navItemClass} ${interactiveClass} hidden lg:inline-block`}
          >
            {t.login}
          </a>
          <Button
            onClick={onCtaClick}
            className="hidden lg:inline-flex"
            asChild={!onCtaClick}
          >
            {onCtaClick ? <span>{t.cta}</span> : <Link to="/pilot-program">{t.cta}</Link>}
          </Button>

          {/* Language switch */}
          <div className="hidden lg:flex items-center text-xs font-now font-medium border border-border rounded-full overflow-hidden">
            <button
              onClick={() => setLang("nl")}
              className={`px-2.5 py-1 transition-colors ${
                lang === "nl" ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"
              }`}
              aria-pressed={lang === "nl"}
            >
              NL
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 transition-colors ${
                lang === "en" ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                  <Logo />
                </div>
                <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-now font-semibold mb-2">
                      {t.services}
                    </div>
                    <ul className="space-y-1">
                      {servicesItems.map((item) => (
                        <li key={item} className="py-2 px-3 font-now font-medium text-foreground/80">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-now font-semibold mb-2">
                      {t.products}
                    </div>
                    <ul className="space-y-1">
                      {productsItems.map((item) => (
                        <li key={item.label}>
                          {item.to ? (
                            <SheetClose asChild>
                              <Link
                                to={item.to}
                                className="block py-2 px-3 rounded-md font-now font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
                              >
                                {item.label}
                              </Link>
                            </SheetClose>
                          ) : (
                            <div className="py-2 px-3 font-now font-medium text-foreground/80">
                              {item.label}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="py-2 px-3 font-now font-medium text-foreground/80">{t.about}</div>
                  <a
                    href="https://www.twentytwentysolutions.io/auth"
                    className="block py-2 px-3 font-now font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    {t.login}
                  </a>
                </nav>
                <div className="p-6 border-t space-y-4">
                  {onCtaClick ? (
                    <SheetClose asChild>
                      <Button className="w-full" onClick={onCtaClick}>
                        {t.cta}
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link to="/pilot-program">{t.cta}</Link>
                      </Button>
                    </SheetClose>
                  )}
                  <div className="flex items-center justify-center text-xs font-now font-medium border border-border rounded-full overflow-hidden w-fit mx-auto">
                    <button
                      onClick={() => setLang("nl")}
                      className={`px-3 py-1.5 transition-colors ${
                        lang === "nl" ? "bg-foreground text-background" : "text-foreground/70"
                      }`}
                    >
                      NL
                    </button>
                    <button
                      onClick={() => setLang("en")}
                      className={`px-3 py-1.5 transition-colors ${
                        lang === "en" ? "bg-foreground text-background" : "text-foreground/70"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export default SiteNav;
