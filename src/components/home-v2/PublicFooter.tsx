import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";

export function PublicFooter() {
  const { t } = useTranslation();
  return (
    <footer id="about" className="border-t border-border py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 font-semibold">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span>TTS</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">{t("footer.tagline")}</p>
            <div className="text-sm space-y-1">
              <a href={`mailto:${t("footer.email")}`} className="block hover:text-primary transition-colors">{t("footer.email")}</a>
              <a href="https://www.linkedin.com/company/twentytwentysolutions" target="_blank" rel="noreferrer" className="block hover:text-primary transition-colors">{t("footer.linkedin")}</a>
              <span className="block text-muted-foreground text-xs">{t("footer.kvk")}</span>
            </div>
          </div>

          <FooterCol title={t("footer.colServices")} items={[
            t("nav.servicesItems.agents"),
            t("nav.servicesItems.automations"),
            t("nav.servicesItems.custom"),
            t("nav.servicesItems.consultancy"),
          ]} />

          <FooterCol title={t("footer.colProducts")} items={[
            t("nav.productsItems.soap"),
            t("nav.productsItems.recruitment"),
            t("nav.productsItems.confidence"),
          ]} />

          <FooterCol title={t("footer.colCompany")} items={[
            t("footer.items.about"),
            t("footer.items.cases"),
            t("footer.items.contact"),
            t("footer.items.privacy"),
            t("footer.items.terms"),
          ]} />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-border text-xs text-muted-foreground">
          <span>{t("footer.rights")}</span>
          <LanguageToggle />
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:text-primary transition-colors">{i}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
