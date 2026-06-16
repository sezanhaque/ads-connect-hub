import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Lang = "nl" | "en";

const copy = {
  nl: {
    eyebrow: "AI voor groeiend MKB",
    h1Line1: "Wij maken AI toepasbaar",
    h1Line2: "voor jouw bedrijf.",
    sub1: "Groeiende bedrijven lopen vast op losse tools en handmatige processen.",
    sub2: "Wij lossen dat op met AI die wél werkt. Gebouwd voor jouw situatie.",
    cta1: "Plan een kennismaking",
    cta2: "Bekijk onze diensten",
  },
  en: {
    eyebrow: "AI for growing businesses",
    h1Line1: "We make AI work",
    h1Line2: "for your business.",
    sub1: "Growing companies get stuck on disconnected tools and manual processes.",
    sub2: "We solve that with AI that actually works. Built for your situation.",
    cta1: "Book an intro call",
    cta2: "Explore our services",
  },
} as const;

const terminalLines = [
  "Analyseren van bedrijfsprocessen...",
  "3 knelpunten gevonden in operations",
  "AI agent gekoppeld aan CRM systeem",
  "Rapportage automatisch gegenereerd",
  "Tijdsbesparing: 12 uur per week",
  "Status: actief en werkend ✓",
];

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "nl";
    return (localStorage.getItem("lang") as Lang) || "nl";
  });

  useEffect(() => {
    const sync = () => {
      const next = (localStorage.getItem("lang") as Lang) || "nl";
      setLang(next);
    };
    window.addEventListener("storage", sync);
    const interval = window.setInterval(sync, 300);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(interval);
    };
  }, []);

  return lang;
}

function Terminal() {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (lineIndex >= terminalLines.length) {
      setDone(true);
      return;
    }
    const line = terminalLines[lineIndex];
    if (charIndex < line.length) {
      const t = window.setTimeout(() => {
        setCurrentText(line.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 28);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setCompletedLines((prev) => [...prev, line]);
      setCurrentText("");
      setCharIndex(0);
      setLineIndex(lineIndex + 1);
    }, 380);
    return () => window.clearTimeout(t);
  }, [charIndex, lineIndex, done]);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#0f172a]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0b1220] border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="p-5 md:p-6 font-mono text-sm md:text-[0.95rem] leading-relaxed text-slate-100 min-h-[300px]">
        {completedLines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            <span className="text-slate-500 mr-2">$</span>
            {line}
          </div>
        ))}
        {!done && (
          <div className="whitespace-pre-wrap break-words">
            <span className="text-slate-500 mr-2">$</span>
            {currentText}
            <span className="inline-block w-2 h-4 bg-slate-100 ml-0.5 align-middle animate-pulse" />
          </div>
        )}
        {done && (
          <div>
            <span className="text-slate-500 mr-2">$</span>
            <span className="inline-block w-2 h-4 bg-slate-100 align-middle animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  const lang = useLang();
  const t = copy[lang];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Subtle dot grid background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground) / 0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 55%, transparent 100%)",
        }}
      />

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            className="space-y-6 min-w-0 order-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="inline-flex items-center text-xs font-semibold tracking-[0.18em] uppercase font-now text-primary"
            >
              {t.eyebrow}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-now font-extrabold tracking-tight leading-[1.1] text-[clamp(2.25rem,5.5vw,4rem)] text-foreground"
            >
              <span className="block">{t.h1Line1}</span>
              <span className="block bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent">
                {t.h1Line2}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-2 max-w-xl"
            >
              <p className="text-base md:text-lg text-muted-foreground font-now font-light leading-relaxed">
                {t.sub1}
              </p>
              <p className="text-base md:text-lg text-muted-foreground font-now font-light leading-relaxed">
                {t.sub2}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/contact">
                  {t.cta1}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/diensten">{t.cta2}</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Terminal */}
          <motion.div
            className="order-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Terminal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
