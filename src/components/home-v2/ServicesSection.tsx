import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { FadeIn, Eyebrow } from "./Section";

type Item = { n: string; t: string; d: string; tags: string[]; cta: string; preview: string[] };

export function ServicesSection() {
  const { t } = useTranslation();
  const items = t("services.items", { returnObjects: true }) as Item[];

  return (
    <section id="services" className="py-32 md:py-40 border-t border-border">
      <div className="container mx-auto px-4">
        <FadeIn className="max-w-2xl mb-20 space-y-4">
          <Eyebrow>{t("services.eyebrow")}</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t("services.title")}</h2>
          <p className="text-lg text-muted-foreground">{t("services.sub")}</p>
        </FadeIn>
        <div className="space-y-16">
          {items.map((item, i) => (
            <FadeIn key={item.n}>
              <div className="grid lg:grid-cols-[auto_1fr_auto] gap-8 lg:gap-12 items-start border-t border-border pt-12">
                <div className="text-sm font-mono text-primary">({item.n})</div>
                <div className="max-w-2xl space-y-4">
                  <h3 className="text-2xl md:text-3xl font-bold">{item.t}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.d}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a href="#contact" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all pt-2">
                    {item.cta} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <MiniTerminal lines={item.preview} />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniTerminal({ lines }: { lines: string[] }) {
  return (
    <div className="w-full lg:w-[280px] bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border bg-muted/30 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-foreground/20" />
        <span className="h-2 w-2 rounded-full bg-foreground/20" />
        <span className="h-2 w-2 rounded-full bg-foreground/20" />
      </div>
      <div className="p-4 font-mono text-xs space-y-1.5 min-h-[140px] text-muted-foreground">
        {lines.map((l, i) => (
          <div key={i} className={i === lines.length - 1 ? "text-primary" : ""}>{l}</div>
        ))}
      </div>
    </div>
  );
}
