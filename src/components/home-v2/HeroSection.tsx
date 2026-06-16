import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useDemoDialog } from "./DemoDialogContext";
import { Eyebrow } from "./Section";

export function HeroSection() {
  const { t } = useTranslation();
  const { open } = useDemoDialog();
  const lines = [
    t("hero.terminal.line1"),
    t("hero.terminal.line2"),
    t("hero.terminal.line3"),
    t("hero.terminal.line4"),
    t("hero.terminal.line5"),
  ];

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground) / 0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />
      <div className="container mx-auto px-4 py-24 md:py-32 relative">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
            >
              <span className="block">{t("hero.title1")}</span>
              <span className="block text-muted-foreground">{t("hero.title2")}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light"
            >
              {t("hero.sub")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={open}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover transition-colors px-6 py-3 rounded-md font-medium"
              >
                {t("hero.ctaPrimary")} <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 border border-border text-foreground hover:bg-muted transition-colors px-6 py-3 rounded-md font-medium"
              >
                {t("hero.ctaSecondary")}
              </a>
            </motion.div>
          </div>

          <Terminal lines={lines} />
        </div>
      </div>
    </section>
  );
}

function Terminal({ lines }: { lines: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl"
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
        <span className="ml-3 text-[10px] uppercase tracking-widest text-muted-foreground">tts ~ shell</span>
      </div>
      <div className="p-6 font-mono text-sm space-y-2 min-h-[260px]">
        {lines.map((line, i) => (
          <motion.div
            key={line}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.4, duration: 0.3 }}
            className={i === lines.length - 1 ? "text-primary" : "text-muted-foreground"}
          >
            {line}
          </motion.div>
        ))}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-primary align-middle"
        />
      </div>
    </motion.div>
  );
}
