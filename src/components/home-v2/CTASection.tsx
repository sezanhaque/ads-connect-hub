import { useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";
import { useDemoDialog } from "./DemoDialogContext";
import { FadeIn } from "./Section";

export function CTASection() {
  const { t } = useTranslation();
  const { open } = useDemoDialog();
  const trust = t("finalCta.trust", { returnObjects: true }) as string[];

  return (
    <section id="contact" className="py-32 md:py-40">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <FadeIn className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            {t("finalCta.title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("finalCta.sub")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={open}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors px-6 py-3 rounded-md font-medium"
            >
              {t("finalCta.primary")} <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="mailto:hello@twentytwentysolutions.io"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground hover:bg-muted transition-colors px-6 py-3 rounded-md font-medium"
            >
              {t("finalCta.secondary")}
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
            {trust.map((tt) => (
              <span key={tt} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" /> {tt}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
