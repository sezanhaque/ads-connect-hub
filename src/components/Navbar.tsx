import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Lang = "nl" | "en";

interface NavItem {
  title: string;
  desc: string;
  href?: string;
  soon?: boolean;
}

const servicesItems: NavItem[] = [
  {
    title: "AI Agents",
    desc: "Agents die zelfstandig taken uitvoeren in jouw systemen",
    href: "/diensten/ai-agents",
  },
  {
    title: "AI Automations",
    desc: "Handmatige processen volledig automatiseren",
    href: "/diensten/ai-automations",
  },
  {
    title: "Maatwerk AI ontwikkeling",
    desc: "Een systeem dat jouw losse tools vervangt",
    href: "/diensten/maatwerk",
  },
];

const productItems: NavItem[] = [
  {
    title: "SOAP",
    desc: "Recruitment advertenties op Meta en TikTok, volledig geautomatiseerd",
    href: "/platform-overview",
  },
  {
    title: "Recruitment AI",
    desc: "Binnenkort beschikbaar",
    soon: true,
  },
  {
    title: "Confidence AI",
    desc: "Binnenkort beschikbaar",
    soon: true,
  },
];

function DesktopDropdown({
  label,
  items,
}: {
  label: string;
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  const onEnter = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(true);
  };
  const onLeave = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors font-now"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[360px] z-50",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none",
          "transition-all duration-150"
        )}
      >
        <div className="rounded-xl border border-border/60 bg-popover/95 backdrop-blur shadow-lg p-2">
          {items.map((it) => {
            const inner = (
              <div className="flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/60 transition-colors">
                <div>
                  <div
                    className={cn(
                      "font-semibold font-now text-sm",
                      it.soon ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {it.title}
                  </div>
                  <div className="text-xs text-muted-foreground font-now mt-0.5">
                    {it.desc}
                  </div>
                </div>
                {it.soon && (
                  <span className="shrink-0 self-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Binnenkort
                  </span>
                )}
              </div>
            );
            if (it.soon || !it.href) {
              return (
                <div
                  key={it.title}
                  className="cursor-not-allowed opacity-80"
                  aria-disabled
                >
                  {inner}
                </div>
              );
            }
            return (
              <Link key={it.title} to={it.href}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LangSwitch({
  lang,
  setLang,
  className,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-now",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLang("nl")}
        className={cn(
          "px-1.5 py-1 transition-colors",
          lang === "nl"
            ? "font-bold text-foreground underline underline-offset-4"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        NL
      </button>
      <span className="text-muted-foreground/60">/</span>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "px-1.5 py-1 transition-colors",
          lang === "en"
            ? "font-bold text-foreground underline underline-offset-4"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </div>
  );
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "nl";
    return (localStorage.getItem("lang") as Lang) || "nl";
  });
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "backdrop-blur-md bg-background/70 border-b border-border/40"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" aria-label="Home">
            <Logo size="sm" showText={false} />
          </Link>

          {/* Desktop center */}
          <div className="hidden lg:flex items-center gap-8">
            <DesktopDropdown label="Diensten" items={servicesItems} />
            <DesktopDropdown label="Producten" items={productItems} />
            <Link
              to="/over-ons"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors font-now"
            >
              Over ons
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors font-now"
            >
              Contact
            </Link>
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="outline" asChild size="sm" className="font-now">
              <a
                href="https://app.soap.twentytwentysolutions.io"
                target="_blank"
                rel="noreferrer"
              >
                Inloggen
              </a>
            </Button>
            <LangSwitch lang={lang} setLang={setLang} />
            <Button asChild size="sm" className="font-now group">
              <Link to="/contact">
                Plan een kennismaking
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </div>

      {/* Mobile overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[60] bg-background transition-transform duration-300 ease-out",
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto px-4 h-full flex flex-col">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center" aria-label="Home">
              <Logo size="sm" showText={false} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted/60 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="diensten" className="border-border/60">
                <AccordionTrigger className="font-now text-base font-semibold">
                  Diensten
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1 pl-1">
                    {servicesItems.map((it) => (
                      <Link
                        key={it.title}
                        to={it.href!}
                        className="rounded-md px-3 py-2 hover:bg-muted/60"
                      >
                        <div className="font-semibold font-now text-sm">
                          {it.title}
                        </div>
                        <div className="text-xs text-muted-foreground font-now">
                          {it.desc}
                        </div>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="producten" className="border-border/60">
                <AccordionTrigger className="font-now text-base font-semibold">
                  Producten
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1 pl-1">
                    {productItems.map((it) => {
                      const content = (
                        <div className="flex items-start justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/60">
                          <div>
                            <div
                              className={cn(
                                "font-semibold font-now text-sm",
                                it.soon
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              )}
                            >
                              {it.title}
                            </div>
                            <div className="text-xs text-muted-foreground font-now">
                              {it.desc}
                            </div>
                          </div>
                          {it.soon && (
                            <span className="shrink-0 self-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Binnenkort
                            </span>
                          )}
                        </div>
                      );
                      if (it.soon || !it.href) {
                        return (
                          <div
                            key={it.title}
                            aria-disabled
                            className="cursor-not-allowed opacity-80"
                          >
                            {content}
                          </div>
                        );
                      }
                      return (
                        <Link key={it.title} to={it.href}>
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-2 flex flex-col">
              <Link
                to="/over-ons"
                className="py-4 border-b border-border/60 font-now text-base font-semibold"
              >
                Over ons
              </Link>
              <Link
                to="/contact"
                className="py-4 border-b border-border/60 font-now text-base font-semibold"
              >
                Contact
              </Link>
            </div>

            <div className="mt-6 border-t border-border/60 pt-6 flex flex-col gap-4">
              <Button variant="outline" asChild className="w-full font-now">
                <a
                  href="https://app.soap.twentytwentysolutions.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  Inloggen
                </a>
              </Button>
              <LangSwitch
                lang={lang}
                setLang={setLang}
                className="justify-center"
              />
              <Button asChild className="w-full font-now">
                <Link to="/contact">
                  Plan een kennismaking
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;