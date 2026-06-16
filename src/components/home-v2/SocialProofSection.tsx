import { useTranslation } from "react-i18next";

export function SocialProofSection() {
  const { t } = useTranslation();
  const logos = t("social.logos", { returnObjects: true }) as string[];
  const repeated = [...logos, ...logos];

  return (
    <section className="py-20 border-y border-border overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-10">
          {t("social.caption")}
        </p>
      </div>
      <div className="relative">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {repeated.map((name, i) => (
            <div key={i} className="flex items-center justify-center px-6 py-3 border border-border rounded-md bg-card/40 text-muted-foreground text-sm font-medium tracking-wide min-w-[200px]">
              {name}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes tts-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: tts-marquee 40s linear infinite; }
      `}</style>
    </section>
  );
}
