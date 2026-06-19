import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

const servicesItems = (lang: Lang): { label: string; to?: string }[] => [
  { label: "AI Agent", to: `/${lang}/ai-agents` },
  { label: "AI Automation" },
  { label: "Custom AI Development" },
];

interface SiteNavProps {
  onCtaClick?: () => void;
}

export function SiteNav({ onCtaClick }: SiteNavProps) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "nl";
    return (localStorage.getItem("site-lang") as Lang) || "nl";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("site-lang", lang);
  }, [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = copy[lang];

  const productsItems: { label: string; to?: string }[] = [
    { label: "SOAP", to: "/platform-overview" },
    { label: "Recruitment AI" },
    { label: "Confidence AI" },
  ];

  const navItemClass = "text-foreground/80 font-now font-medium text-sm";
  const interactiveClass = "hover:text-foreground transition-colors cursor-pointer";

  const isActive = (to?: string) => !!to && location.pathname === to;

  const DropdownItem = ({ children, to }: { children: React.ReactNode; to?: string }) => {
    const base =
      "relative block px-5 py-2.5 text-sm font-now font-medium text-foreground/80 select-none transition-colors";
    const hover =
      "hover:bg-muted hover:text-foreground before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-foreground before:opacity-0 hover:before:opacity-100 before:transition-opacity";
    if (to) {
      return (
        <Link to={to} className={`${base} ${hover}`}>
          {children}
        </Link>
      );
    }
    return <div className={base}>{children}</div>;
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-background/70 border-b border-border/60 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-5">
        <nav className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="20/20 home">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Diensten dropdown (hover) */}
            <div className="relative group">
              <span
                className={`${navItemClass} ${interactiveClass} inline-flex items-center gap-1 px-4 py-2 rounded-md`}
              >
                {t.services}
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </span>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                <div className="bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-border min-w-[240px] py-2">
                  {servicesItems(lang).map((item) => (
                    <DropdownItem key={item.label} to={item.to}>
                      {item.label}
                    </DropdownItem>
                  ))}
                </div>
              </div>
            </div>

            {/* Producten dropdown (hover) */}
            <div className="relative group">
              <span
                className={`${navItemClass} ${interactiveClass} inline-flex items-center gap-1 px-4 py-2 rounded-md`}
              >
                {t.products}
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </span>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                <div className="bg-white rounded-xl shadow-xl ring-1 ring-black/5 border border-border min-w-[240px] py-2">
                  {productsItems.map((item) => (
                    <DropdownItem key={item.label} to={item.to}>
                      {item.label}
                    </DropdownItem>
                  ))}
                </div>
              </div>
            </div>

            {/* Over ons (not clickable) */}
            <span className={`${navItemClass} px-4 py-2`}>{t.about}</span>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.twentytwentysolutions.io/auth"
              className={`${navItemClass} ${interactiveClass} hidden lg:inline-block px-3 py-2`}
            >
              {t.login}
            </a>
            <Button
              onClick={onCtaClick}
              size="lg"
              className="hidden lg:inline-flex h-11 px-6 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
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
              <SheetContent
                side="top"
                className="w-full h-[100dvh] p-0 border-b data-[state=open]:animate-fade-in"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-6 border-b">
                    <Logo />
                  </div>
                  <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-now font-semibold mb-3">
                        {t.services}
                      </div>
                      <ul className="space-y-2">
                        {servicesItems(lang).map((item) => (
                          <li key={item.label}>
                            {item.to ? (
                              <SheetClose asChild>
                                <Link
                                  to={item.to}
                                  className="block py-3 px-3 rounded-md font-now font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors text-base"
                                >
                                  {item.label}
                                </Link>
                              </SheetClose>
                            ) : (
                              <div className="py-3 px-3 font-now font-medium text-foreground/80 text-base">
                                {item.label}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-now font-semibold mb-3">
                        {t.products}
                      </div>
                      <ul className="space-y-2">
                        {productsItems.map((item) => (
                          <li key={item.label}>
                            {item.to ? (
                              <SheetClose asChild>
                                <Link
                                  to={item.to}
                                  className="block py-3 px-3 rounded-md font-now font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors text-base"
                                >
                                  {item.label}
                                </Link>
                              </SheetClose>
                            ) : (
                              <div className="py-3 px-3 font-now font-medium text-foreground/80 text-base">
                                {item.label}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="py-3 px-3 font-now font-medium text-foreground/80 text-base">{t.about}</div>
                    <a
                      href="https://www.twentytwentysolutions.io/auth"
                      className="block py-3 px-3 font-now font-medium text-foreground hover:bg-muted rounded-md transition-colors text-base"
                    >
                      {t.login}
                    </a>
                  </nav>
                  <div className="p-6 border-t space-y-4">
                    {onCtaClick ? (
                      <SheetClose asChild>
                        <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={onCtaClick}>
                          {t.cta}
                        </Button>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Button asChild size="lg" className="w-full h-12 text-base font-semibold">
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
      </div>
    </header>
  );
}

export default SiteNav;
