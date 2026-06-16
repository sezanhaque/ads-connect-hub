import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { FadeIn, Eyebrow } from "./Section";

type C = { tag: string; t: string; d: string; cta: string };

export function CasesSection() {
  const { t } = useTranslation();
  const items = t("cases.items", { returnObjects: true }) as C[];

  return (
    <section id="cases" className="py-32 md:py-40 border-t border-border">
      <div className="container mx-auto px-4">
        <FadeIn className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div className="space-y-4 max-w-2xl">
            <Eyebrow>{t("cases.eyebrow")}</Eyebrow>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t("cases.title")}</h2>
            <p className="text-lg text-muted-foreground">{t("cases.sub")}</p>
          </div>
          <a href="#cases-all" className="inline-flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all">
            {t("cases.all")} <ArrowRight className="h-4 w-4" />
          </a>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((c, i) => (
            <FadeIn key={c.t} delay={i * 0.08}>
              <a href="#cases-all" className="block h-full p-8 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/40 hover:-translate-y-1 transition-all">
                <div className="text-xs uppercase tracking-[0.2em] text-primary mb-6">{c.tag}</div>
                <h3 className="text-xl font-bold mb-3 leading-snug">{c.t}</h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{c.d}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  {c.cta} <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
