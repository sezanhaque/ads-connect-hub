import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/SiteNav";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  Inbox,
  CalendarCheck,
  Wallet,
  Sparkles,
  Zap,
  Shield,
  Clock,
  MessageSquare,
  Settings,
  Rocket,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";

type Lang = "nl" | "en";

const COPY = {
  nl: {
    hero: {
      title: "Jouw digitale collega voor de taken die blijven liggen",
      sub: "AI Agents van Twenty Twenty Solutions nemen het overzicht, de opvolging en de administratie uit handen, zodat jij je tijd weer aan je vak kunt geven.",
      cta: "Plan een kennismaking",
      trustedBy: "Vertrouwd door MKB-ondernemers",
      trustedSub: "in heel Nederland",
    },
    stats: [
      { stat: "Vaste prijs", desc: "geen verrassingen" },
      { stat: "Binnen 2 weken", desc: "live" },
      { stat: "Nederlands team", desc: "in Haarlem" },
    ],
    problem: {
      label: "Het probleem",
      title: "Herken je dit?",
      body: "Je mist een belangrijke mail tussen de rest. Een klant komt niet opdagen voor zijn afspraak. Een factuur staat al weken open en je vergeet er weer achteraan te gaan. Niet omdat je het niet wilt, maar omdat er simpelweg te weinig uren in een dag zitten.",
    },
    bridge:
      "Daarom bouwen wij AI Agents die deze taken voor je overnemen. Hieronder drie voorbeelden. Heb je een ander probleem, dan bouwen we die net zo goed.",
    cardsTitle: "Onze AI Agents",
    cardsSub: "Kies een agent die direct werk uit handen neemt, of laat ons een nieuwe op maat bouwen.",
    setupLabel: "Setup",
    monthlyLabel: "Maandelijks",
    from: "Vanaf",
    perMonth: "/mnd",
    priceNote: "Startprijs. Definitieve prijs bespreken we tijdens de kennismaking.",
    learnMore: "Meer weten",
    popular: "Meest gekozen",
    cards: [
      {
        icon: Inbox,
        name: "AI PA",
        promise: "Je mist nooit meer een belangrijke mail of telefoontje tussendoor.",
        setup: "€499",
        monthly: "€119",
      },
      {
        icon: CalendarCheck,
        name: "No-Show & Appointment Setter",
        promise:
          "Minder lege stoelen, minder gemiste omzet. Afspraken die zichzelf inplannen en klanten die er ook echt zijn.",
        setup: "€795",
        monthly: "€179",
      },
      {
        icon: Wallet,
        name: "Debtor Agent",
        promise: "Geld dat je al verdiend hebt, sneller binnen, zonder dat jij er zelf achteraan moet.",
        setup: "€595",
        monthly: "€199",
      },
    ],
    catchAll: {
      icon: Sparkles,
      name: "Heb je een ander probleem?",
      promise: "Geen zorgen, dan bouwen we die. Vertel ons wat er bij jou speelt en we komen met een voorstel.",
      cta: "Vertel ons wat er speelt",
    },
    trust: {
      label: "Waarom wij",
      title: "Waarom Twenty Twenty Solutions",
      body: "Wij zijn een Nederlands AI- en SaaS-bedrijf, gevestigd in Haarlem. Geen groot, onpersoonlijk platform, maar een klein team dat precies weet wat er speelt bij groeiende ondernemers. Vaste prijzen, korte levertijden, en altijd een mens aan de andere kant van de lijn.",
      pillars: [
        { icon: Shield, title: "Vaste prijzen", desc: "Geen uurtje-factuurtje. Je weet vooraf wat je betaalt." },
        { icon: Clock, title: "Korte levertijden", desc: "Binnen twee weken draait jouw agent live." },
        { icon: Zap, title: "Altijd een mens", desc: "Een vast aanspreekpunt dat je direct kunt bereiken." },
      ],
    },
    process: {
      label: "Het proces",
      title: "In vier stappen live",
      steps: [
        { n: "01", icon: MessageSquare, t: "Kennismaking", d: "We bespreken wat er bij jou speelt." },
        { n: "02", icon: Inbox, t: "Intake", d: "We stemmen af wat je agent precies moet doen." },
        { n: "03", icon: Settings, t: "Koppeling & inrichting", d: "We sluiten aan op jouw systemen en stellen de agent in." },
        { n: "04", icon: Rocket, t: "Live", d: "Jouw AI Agent draait, en wij blijven in de buurt voor vragen." },
      ],
    },
    closing: {
      title: "Tijd om die taken uit handen te geven",
      body: "Plan een vrijblijvende kennismaking en ontdek wat een AI Agent voor jouw bedrijf kan doen.",
      cta: "Plan een kennismaking",
    },
    faq: {
      title: "Veelgestelde vragen",
      items: [
        {
          q: "Wat kost een AI Agent?",
          a: "Elke agent heeft een eenmalige opstartfee en daarna een vaste maandelijkse fee. De startprijzen verschillen per agent — je vindt ze bij elk van de drie producten hierboven. De definitieve prijs hangt af van jouw situatie en bespreken we tijdens de kennismaking.",
        },
        {
          q: "Hoe snel is mijn AI Agent live?",
          a: "Na de kennismaking volgt een korte intake, waarna we de koppeling met jouw systemen opzetten en de agent voor jou inrichten. Bij de meeste agents ben je binnen één tot twee weken live.",
        },
        {
          q: "Wat als het niet goed werkt?",
          a: "In de eerste maand plannen we een korte check-in om te kijken of alles goed draait en de instellingen kloppen. Daarna staan we voor je klaar zodra je iets wil aanpassen of een vraag hebt.",
        },
        {
          q: "Wat gebeurt er als ik vragen heb na de oplevering?",
          a: "Je hebt altijd een vast aanspreekpunt bij ons. Loopt er iets niet zoals verwacht, of wil je iets bijstellen, dan ben je bij ons aan het juiste adres.",
        },
        {
          q: "Kan ik op elk moment stoppen?",
          a: "Onze agents werken met een minimale looptijd van 6 maanden. Dat geeft ons en jou de tijd om de agent goed te laten landen en het effect echt te zien. Daarna is opzeggen maandelijks mogelijk.",
        },
      ],
    },
  },
  en: {
    hero: {
      title: "Your digital colleague for the tasks that keep slipping",
      sub: "AI Agents by Twenty Twenty Solutions take over the overview, the follow-ups and the admin, so you can give your time back to your craft.",
      cta: "Schedule an introduction",
      trustedBy: "Trusted by SME founders",
      trustedSub: "across the Netherlands",
    },
    stats: [
      { stat: "Fixed price", desc: "no surprises" },
      { stat: "Live within", desc: "two weeks" },
      { stat: "Dutch team", desc: "based in Haarlem" },
    ],
    problem: {
      label: "The problem",
      title: "Sound familiar?",
      body: "You miss an important email between the rest. A client doesn't show up for an appointment. An invoice has been open for weeks and you forget to chase it again. Not because you don't want to, but because there simply aren't enough hours in the day.",
    },
    bridge:
      "That's why we build AI Agents that take these tasks off your plate. Three examples below. If your problem is different, we'll build that one just as well.",
    cardsTitle: "Our AI Agents",
    cardsSub: "Pick an agent that takes work off your plate today, or have us build a custom one.",
    setupLabel: "Setup",
    monthlyLabel: "Monthly",
    from: "From",
    perMonth: "/mo",
    priceNote: "Starting price. Final price is agreed during the introduction call.",
    learnMore: "Learn more",
    popular: "Most popular",
    cards: [
      {
        icon: Inbox,
        name: "AI PA",
        promise: "Never miss an important email or call in the middle of your day again.",
        setup: "€499",
        monthly: "€119",
      },
      {
        icon: CalendarCheck,
        name: "No-Show & Appointment Setter",
        promise:
          "Fewer empty chairs, less missed revenue. Appointments that book themselves and clients who actually show up.",
        setup: "€795",
        monthly: "€179",
      },
      {
        icon: Wallet,
        name: "Debtor Agent",
        promise: "Money you've already earned, in faster, without you having to chase it yourself.",
        setup: "€595",
        monthly: "€199",
      },
    ],
    catchAll: {
      icon: Sparkles,
      name: "Got a different problem?",
      promise: "No worries, we'll build that one too. Tell us what's going on and we'll come back with a proposal.",
      cta: "Tell us what's going on",
    },
    trust: {
      label: "Why us",
      title: "Why Twenty Twenty Solutions",
      body: "We're a Dutch AI and SaaS company based in Haarlem. Not a large, impersonal platform, but a small team that knows exactly what growing business owners are dealing with. Fixed prices, short delivery times, and always a human on the other end of the line.",
      pillars: [
        { icon: Shield, title: "Fixed pricing", desc: "No hourly billing. You know upfront what you pay." },
        { icon: Clock, title: "Short delivery", desc: "Your agent goes live within two weeks." },
        { icon: Zap, title: "Always a human", desc: "A dedicated contact you can reach directly." },
      ],
    },
    process: {
      label: "The process",
      title: "Live in four steps",
      steps: [
        { n: "01", icon: MessageSquare, t: "Introduction", d: "We discuss what's going on at your business." },
        { n: "02", icon: Inbox, t: "Intake", d: "We align on exactly what your agent should do." },
        { n: "03", icon: Settings, t: "Connection & setup", d: "We hook into your systems and configure the agent." },
        { n: "04", icon: Rocket, t: "Live", d: "Your AI Agent is running, and we stay close for questions." },
      ],
    },
    closing: {
      title: "Time to hand those tasks off",
      body: "Schedule a no-strings introduction and discover what an AI Agent can do for your business.",
      cta: "Schedule an introduction",
    },
  },
} as const;

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } },
};

interface AIAgentsProps {
  lang: Lang;
}

const AIAgents = ({ lang }: AIAgentsProps) => {
  const t = COPY[lang];
  const bookingHref = "/pilot-program";

  // Highlight the middle card (index 1)
  const highlightedIdx = 1;

  const cardAccents = [
    "hover:border-[hsl(var(--usp-gradient-start))] hover:shadow-[0_8px_30px_-8px_hsl(var(--usp-gradient-start)/0.18)]",
    "", // highlighted
    "hover:border-[hsl(var(--usp-gradient-end))] hover:shadow-[0_8px_30px_-8px_hsl(var(--usp-gradient-end)/0.18)]",
  ];
  const iconBgs = [
    "bg-[hsl(var(--usp-gradient-start)/0.12)]",
    "bg-primary-foreground/15",
    "bg-[hsl(var(--usp-gradient-end)/0.12)]",
  ];
  const iconColors = [
    "text-[hsl(var(--usp-gradient-start))]",
    "text-primary-foreground",
    "text-[hsl(var(--usp-gradient-end))]",
  ];

  return (
    <div className="min-h-screen page-bg">
      <SiteNav />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-20 right-[8%] w-[340px] h-[340px] rounded-full -z-10 pointer-events-none"
          style={{ background: `hsl(var(--usp-gradient-start) / 0.06)` }}
        />
        <div
          className="absolute top-[40%] left-[5%] w-[260px] h-[260px] rounded-full -z-10 pointer-events-none"
          style={{ background: `hsl(var(--usp-gradient-mid) / 0.05)` }}
        />
        <div
          className="absolute bottom-0 right-[20%] w-[200px] h-[200px] rounded-full -z-10 pointer-events-none"
          style={{ background: `hsl(var(--usp-gradient-end) / 0.05)` }}
        />

        <div className="container mx-auto px-4 pt-12 md:pt-20 pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="secondary" className="font-now text-xs uppercase tracking-wider">
              AI Agents
            </Badge>
            <h1 className="font-now font-extrabold tracking-tight leading-[1.12] text-[clamp(2rem,5vw,3.75rem)]">
              <span className="bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent">
                {t.hero.title}
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-now font-light leading-relaxed max-w-2xl mx-auto">
              {t.hero.sub}
            </p>

            {/* Social proof + CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
              <Button
                size="lg"
                asChild
                className="text-sm md:text-base px-8 md:px-10 py-5 md:py-6 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] to-[hsl(var(--usp-gradient-mid))] hover:opacity-95 text-primary-foreground"
              >
                <Link to={bookingHref}>
                  {t.hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {[avatar1, avatar2, avatar3, avatar4].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-background object-cover object-top"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  <span className="font-semibold text-foreground">{t.hero.trustedBy}</span>
                  <br />
                  {t.hero.trustedSub}
                </p>
              </div>
            </div>
          </motion.div>

          {/* USP stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-4xl mx-auto mt-12 md:mt-16"
          >
            <div
              className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50 rounded-2xl p-1"
              style={{ background: `hsl(var(--value-bar-bg))` }}
            >
              {t.stats.map((item, i) => {
                const icons = [Shield, Clock, Zap];
                const Ico = icons[i];
                return (
                  <div key={i} className="flex items-center gap-3 px-6 py-5 sm:justify-center">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 shrink-0">
                      <Ico className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground text-sm leading-tight">{item.stat}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-4"
        >
          <span className="section-label">{t.problem.label}</span>
          <h2 className="font-now font-bold text-3xl md:text-4xl">{t.problem.title}</h2>
          <p className="text-muted-foreground font-now leading-relaxed text-base md:text-lg">
            {t.problem.body}
          </p>
          <p className="pt-4 max-w-2xl mx-auto text-center font-now text-base md:text-lg text-foreground/80">
            {t.bridge}
          </p>
        </motion.div>
      </section>

      {/* ─── AGENT CARDS ─── */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 font-now">
            {t.cardsTitle}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-light">
            {t.cardsSub}
          </p>
        </motion.div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto"
        >
          {t.cards.map((card, idx) => {
            const Icon = card.icon;
            const highlighted = idx === highlightedIdx;
            return (
              <motion.div
                key={card.name}
                variants={stagger.item}
                className={`relative rounded-2xl p-6 md:p-7 flex flex-col transition-all duration-300 ${
                  highlighted
                    ? "bg-gradient-to-br from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] text-white shadow-2xl ring-2 ring-[hsl(var(--usp-gradient-mid)/0.3)] lg:scale-[1.03] z-10"
                    : `bg-card border border-border shadow-sm hover:-translate-y-1 ${cardAccents[idx]}`
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-foreground text-background border-0 px-4 py-1 text-xs font-bold shadow-lg uppercase tracking-wide">
                      {t.popular}
                    </Badge>
                  </div>
                )}

                <div className="mb-5">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${iconBgs[idx]}`}>
                    <Icon className={`w-5 h-5 ${iconColors[idx]}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 font-now">{card.name}</h3>
                  <p
                    className={`text-sm leading-relaxed font-now ${
                      highlighted ? "text-white/80" : "text-muted-foreground"
                    }`}
                  >
                    {card.promise}
                  </p>
                </div>

                <div
                  className={`text-sm space-y-2.5 mb-5 pb-5 border-b ${
                    highlighted ? "border-white/15" : "border-border"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className={highlighted ? "text-white/65" : "text-muted-foreground"}>
                      {t.setupLabel}
                    </span>
                    <span className="font-semibold">
                      {t.from} {card.setup}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={highlighted ? "text-white/65" : "text-muted-foreground"}>
                      {t.monthlyLabel}
                    </span>
                    <span className="font-semibold">
                      {t.from} {card.monthly}
                      {t.perMonth}
                    </span>
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed mb-5 ${
                    highlighted ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {t.priceNote}
                </p>

                <Button
                  asChild
                  size="lg"
                  className={`w-full group mt-auto ${
                    highlighted
                      ? "bg-white text-foreground hover:bg-white/90 font-bold shadow-lg"
                      : ""
                  }`}
                  variant={highlighted ? undefined : "default"}
                >
                  <Link to={bookingHref}>
                    {t.learnMore}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Catch-all banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto mt-8"
        >
          <div className="relative rounded-2xl border border-dashed border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-primary/40 transition-colors">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
              <t.catchAll.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-now font-bold text-lg md:text-xl">{t.catchAll.name}</h3>
              <p className="text-sm md:text-base text-muted-foreground font-now leading-relaxed">
                {t.catchAll.promise}
              </p>
            </div>
            <Button asChild size="lg" className="group shrink-0">
              <Link to={bookingHref}>
                {t.catchAll.cta}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ─── TRUST ─── */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center space-y-4 mb-12"
          >
            <span className="section-label">{t.trust.label}</span>
            <h2 className="font-now font-bold text-3xl md:text-4xl">{t.trust.title}</h2>
            <p className="text-muted-foreground font-now leading-relaxed text-base md:text-lg">
              {t.trust.body}
            </p>
          </motion.div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
          >
            {t.trust.pillars.map((p) => {
              const Ico = p.icon;
              return (
                <motion.div
                  key={p.title}
                  variants={stagger.item}
                  className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 mb-4">
                    <Ico className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-now font-bold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground font-now leading-relaxed">{p.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-4 mb-12"
        >
          <span className="section-label">{t.process.label}</span>
          <h2 className="font-now font-bold text-3xl md:text-4xl">{t.process.title}</h2>
        </motion.div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
        >
          {t.process.steps.map((step, i) => {
            const Ico = step.icon;
            return (
              <motion.div
                key={step.n}
                variants={stagger.item}
                className="relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="absolute top-4 right-5 text-3xl font-bold font-now bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent opacity-80">
                  {step.n}
                </div>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 mb-4">
                  <Ico className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-now font-bold text-lg mb-2">{step.t}</h3>
                <p className="text-sm text-muted-foreground font-now leading-relaxed">{step.d}</p>
                {i < t.process.steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── CLOSING CTA ─── */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden p-10 md:p-16 text-center bg-gradient-to-br from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] text-white shadow-2xl"
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative space-y-5 max-w-2xl mx-auto">
            <h2 className="font-now font-bold text-3xl md:text-4xl leading-tight">{t.closing.title}</h2>
            <p className="text-white/85 font-now text-base md:text-lg leading-relaxed">
              {t.closing.body}
            </p>
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                asChild
                className="bg-white text-foreground hover:bg-white/90 font-bold rounded-full px-8 md:px-10 py-5 md:py-6 shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]"
              >
                <Link to={bookingHref}>
                  {t.closing.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default AIAgents;
