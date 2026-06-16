import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { FadeIn, Eyebrow } from "./Section";

export function TwoPillarsSection() {
  const { t } = useTranslation();
  const products = {
    label: t("pillars.products.label"),
    title: t("pillars.products.title"),
    sub: t("pillars.products.sub"),
    items: t("pillars.products.items", { returnObjects: true }) as string[],
    cta: t("pillars.products.cta"),
  };
  const services = {
    label: t("pillars.services.label"),
    title: t("pillars.services.title"),
    sub: t("pillars.services.sub"),
    items: t("pillars.services.items", { returnObjects: true }) as string[],
    cta: t("pillars.services.cta"),
  };

  return (
    <section id="products" className="py-32 md:py-40">
      <div className="container mx-auto px-4">
        <FadeIn className="max-w-2xl mb-16 space-y-4">
          <Eyebrow>{t("pillars.eyebrow")}</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t("pillars.title")}</h2>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-6">
          <PillarCard accent {...products} />
          <PillarCard {...services} />
        </div>
      </div>
    </section>
  );
}

function PillarCard({ label, title, sub, items, cta, accent }: { label: string; title: string; sub: string; items: string[]; cta: string; accent?: boolean }) {
  return (
    <FadeIn>
      <div className={`relative h-full p-10 md:p-12 rounded-2xl border border-border bg-card/40 hover:bg-card transition-colors ${accent ? "" : ""}`}>
        {accent && <div className="absolute top-0 left-10 right-10 h-px bg-primary" />}
        <div className="text-xs uppercase tracking-[0.2em] text-primary mb-6">{label}</div>
        <h3 className="text-3xl md:text-4xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground mb-8">{sub}</p>
        <ul className="space-y-3 mb-10">
          {items.map((i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-primary">→</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
        <a href="#services" className="inline-flex items-center gap-2 text-sm font-medium border border-border hover:bg-muted transition-colors px-4 py-2 rounded-md">
          {cta} <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </FadeIn>
  );
}
