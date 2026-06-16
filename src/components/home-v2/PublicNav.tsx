import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { useDemoDialog } from "./DemoDialogContext";

export function PublicNav() {
  const { t } = useTranslation();
  const { open } = useDemoDialog();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | "services" | "products">(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const servicesItems = [
    { label: t("nav.servicesItems.agents"), to: "#services" },
    { label: t("nav.servicesItems.automations"), to: "#services" },
    { label: t("nav.servicesItems.custom"), to: "#services" },
    { label: t("nav.servicesItems.consultancy"), to: "#services" },
  ];
  const productsItems = [
    { label: t("nav.productsItems.soap"), to: "/meta-job-ads" },
    { label: t("nav.productsItems.recruitment"), to: "#products" },
    { label: t("nav.productsItems.confidence"), to: "#products" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-md bg-background/70 border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ArrowUpRight className="h-4 w-4 text-primary" />
          <span>TTS</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-xs uppercase tracking-[0.15em] font-medium">
          <NavDropdown
            label={t("nav.services")}
            items={servicesItems}
            open={openMenu === "services"}
            onOpen={() => setOpenMenu("services")}
            onClose={() => setOpenMenu(null)}
          />
          <NavDropdown
            label={t("nav.products")}
            items={productsItems}
            open={openMenu === "products"}
            onOpen={() => setOpenMenu("products")}
            onClose={() => setOpenMenu(null)}
          />
          <a href="#cases" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">{t("nav.cases")}</a>
          <a href="#about" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">{t("nav.about")}</a>
          <a href="#contact" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">{t("nav.contact")}</a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle className="hidden md:inline-flex" />
          <Link
            to="/auth"
            className="hidden md:inline-flex items-center gap-2 border border-border text-foreground hover:bg-muted transition-colors px-4 py-2 rounded-md text-sm font-medium"
          >
            {t("nav.login")}
          </Link>
          <button
            onClick={open}
            className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors px-4 py-2 rounded-md text-sm font-medium"
          >
            {t("nav.cta")}
          </button>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between border-b border-border">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-semibold">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span>TTS</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 text-lg">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("nav.services")}</div>
              {servicesItems.map((i) => (
                <a key={i.label} href={i.to} onClick={() => setMobileOpen(false)} className="block py-2 hover:text-primary transition-colors">{i.label}</a>
              ))}
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("nav.products")}</div>
              {productsItems.map((i) => (
                <Link key={i.label} to={i.to} onClick={() => setMobileOpen(false)} className="block py-2 hover:text-primary transition-colors">{i.label}</Link>
              ))}
            </div>
            <div className="space-y-1 border-t border-border pt-6">
              <a href="#cases" onClick={() => setMobileOpen(false)} className="block py-2">{t("nav.cases")}</a>
              <a href="#about" onClick={() => setMobileOpen(false)} className="block py-2">{t("nav.about")}</a>
              <a href="#contact" onClick={() => setMobileOpen(false)} className="block py-2">{t("nav.contact")}</a>
            </div>
          </div>
          <div className="border-t border-border p-6 space-y-3">
            <LanguageToggle />
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center border border-border text-foreground hover:bg-muted transition-colors px-4 py-3 rounded-md text-sm font-medium"
            >
              {t("nav.login")}
            </Link>
            <button
              onClick={() => { setMobileOpen(false); open(); }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-hover transition-colors px-4 py-3 rounded-md text-sm font-medium"
            >
              {t("nav.cta")}
            </button>
          </div>

        </div>
      )}
    </header>
  );
}

function NavDropdown({
  label, items, open, onOpen, onClose,
}: {
  label: string;
  items: { label: string; to: string }[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button className="px-3 py-2 inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 min-w-[240px]">
          <div className="bg-card border border-border rounded-lg shadow-lg p-2">
            {items.map((i) => (
              i.to.startsWith("/") ? (
                <Link key={i.label} to={i.to} className="block px-3 py-2 text-sm rounded hover:bg-muted text-foreground normal-case tracking-normal">
                  {i.label}
                </Link>
              ) : (
                <a key={i.label} href={i.to} className="block px-3 py-2 text-sm rounded hover:bg-muted text-foreground normal-case tracking-normal">
                  {i.label}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
