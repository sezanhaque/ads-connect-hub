import { useTranslation } from "react-i18next";
import { FadeIn, Eyebrow } from "./Section";

type Step = { n: string; t: string; time: string; d: string };

export function ProcessSection() {
  const { t } = useTranslation();
  const steps = t("process.steps", { returnObjects: true }) as Step[];

  return (
    <section className="py-32 md:py-40">
      <div className="container mx-auto px-4">
        <FadeIn className="max-w-2xl mb-20 space-y-4">
          <Eyebrow>{t("process.eyebrow")}</Eyebrow>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t("process.title")}</h2>
          <p className="text-lg text-muted-foreground">{t("process.sub")}</p>
        </FadeIn>
        <div className="relative grid md:grid-cols-4 gap-8">
          <div aria-hidden className="hidden md:block absolute top-3 left-[12.5%] right-[12.5%] h-px bg-border" />
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.08}>
              <div className="relative space-y-3">
                <div className="relative flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-mono inline-flex items-center justify-center relative z-10">
                    {i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                </div>
                <h3 className="text-lg font-semibold">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
