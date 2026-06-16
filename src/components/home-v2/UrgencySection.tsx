import { useTranslation } from "react-i18next";
import { FadeIn, Eyebrow } from "./Section";

type B = { n: string; t: string; d: string };

export function UrgencySection() {
  const { t } = useTranslation();
  const blocks = t("urgency.blocks", { returnObjects: true }) as B[];

  return (
    <section className="py-32 md:py-40 bg-card/30 border-y border-border">
      <div className="container mx-auto px-4">
        <FadeIn className="max-w-3xl mb-16 space-y-4">
          <Eyebrow>{t("urgency.eyebrow")}</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t("urgency.title")}</h2>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          {blocks.map((b, i) => (
            <FadeIn key={b.n} delay={i * 0.08}>
              <div className="space-y-3">
                <div className="text-xs font-mono text-primary">{b.n}</div>
                <h3 className="text-xl font-semibold">{b.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
