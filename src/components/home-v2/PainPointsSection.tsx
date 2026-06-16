import { useTranslation } from "react-i18next";
import { FadeIn, Eyebrow } from "./Section";

type Card = { n: string; t: string; d: string };

export function PainPointsSection() {
  const { t } = useTranslation();
  const cards = t("pain.cards", { returnObjects: true }) as Card[];

  return (
    <section className="py-32 md:py-40">
      <div className="container mx-auto px-4">
        <FadeIn className="max-w-2xl mb-16 space-y-4">
          <Eyebrow>{t("pain.eyebrow")}</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t("pain.title")}</h2>
          <p className="text-lg text-muted-foreground">{t("pain.sub")}</p>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((c, i) => (
            <FadeIn key={c.n} delay={i * 0.05}>
              <div className="group border border-border rounded-xl p-8 bg-card/40 hover:bg-card hover:border-primary/40 transition-all h-full">
                <div className="text-xs font-mono text-primary mb-4">{c.n}</div>
                <h3 className="text-xl font-semibold mb-2">{c.t}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
