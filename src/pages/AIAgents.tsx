import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteNav } from "@/components/SiteNav";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Inbox, CalendarCheck, Wallet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type Lang = "nl" | "en";

const COPY = {
  nl: {
    hero: {
      title: "Jouw digitale collega voor de taken die blijven liggen",
      sub: "AI Agents van Twenty Twenty Solutions nemen het overzicht, de opvolging en de administratie uit handen, zodat jij je tijd weer aan je vak kunt geven.",
      cta: "Plan een kennismaking",
    },
    problem: {
      title: "Herken je dit?",
      body: "Je mist een belangrijke mail tussen de rest. Een klant komt niet opdagen voor zijn afspraak. Een factuur staat al weken open en je vergeet er weer achteraan te gaan. Niet omdat je het niet wilt, maar omdat er simpelweg te weinig uren in een dag zitten.",
    },
    bridge:
      "Daarom bouwen wij AI Agents die deze taken voor je overnemen. Hieronder drie voorbeelden, en heb je een ander probleem, dan bouwen we die net zo goed.",
    cardsTitle: "Onze AI Agents",
    setupLabel: "Setup",
    monthlyLabel: "Maandelijks",
    from: "Vanaf",
    perMonth: "/maand",
    priceNote: "Startprijs. De definitieve prijs bespreken we tijdens de kennismaking.",
    learnMore: "Meer weten",
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
      promise: "Geen zorgen, dan bouwen we die.",
      cta: "Vertel ons wat er speelt",
    },
    trust: {
      title: "Waarom Twenty Twenty Solutions",
      body: "Wij zijn een Nederlands AI- en SaaS-bedrijf, gevestigd in Haarlem. Geen groot, onpersoonlijk platform, maar een klein team dat precies weet wat er speelt bij groeiende ondernemers. Vaste prijzen, korte levertijden, en altijd een mens aan de andere kant van de lijn.",
    },
    process: {
      title: "In vier stappen live",
      steps: [
        { n: "01", t: "Kennismaking", d: "We bespreken wat er bij jou speelt." },
        { n: "02", t: "Intake", d: "We stemmen af wat je agent precies moet doen." },
        { n: "03", t: "Koppeling & inrichting", d: "We sluiten aan op jouw systemen en stellen de agent in." },
        { n: "04", t: "Live", d: "Jouw AI Agent draait, en wij blijven in de buurt voor vragen." },
      ],
    },
    closing: {
      title: "Tijd om die taken uit handen te geven",
      body: "Plan een vrijblijvende kennismaking en ontdek wat een AI Agent voor jouw bedrijf kan doen.",
      cta: "Plan een kennismaking",
    },
  },
  en: {
    hero: {
      title: "Your digital colleague for the tasks that keep slipping",
      sub: "AI Agents by Twenty Twenty Solutions take over the overview, the follow-ups and the admin, so you can give your time back to your craft.",
      cta: "Schedule an introduction",
    },
    problem: {
      title: "Sound familiar?",
      body: "You miss an important email between the rest. A client doesn't show up for an appointment. An invoice has been open for weeks and you forget to chase it again. Not because you don't want to, but because there simply aren't enough hours in the day.",
    },
    bridge:
      "That's why we build AI Agents that take these tasks off your plate. Three examples below, and if your problem is different, we'll build that one just as well.",
    cardsTitle: "Our AI Agents",
    setupLabel: "Setup",
    monthlyLabel: "Monthly",
    from: "From",
    perMonth: "/month",
    priceNote: "Starting price. The final price is agreed during the introduction call.",
    learnMore: "Learn more",
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
      promise: "No worries, we'll build that one too.",
      cta: "Tell us what's going on",
    },
    trust: {
      title: "Why Twenty Twenty Solutions",
      body: "We're a Dutch AI and SaaS company based in Haarlem. Not a large, impersonal platform, but a small team that knows exactly what growing business owners are dealing with. Fixed prices, short delivery times, and always a human on the other end of the line.",
    },
    process: {
      title: "Live in four steps",
      steps: [
        { n: "01", t: "Introduction", d: "We discuss what's going on at your business." },
        { n: "02", t: "Intake", d: "We align on exactly what your agent should do." },
        { n: "03", t: "Connection & setup", d: "We hook into your systems and configure the agent." },
        { n: "04", t: "Live", d: "Your AI Agent is running, and we stay close for questions." },
      ],
    },
    closing: {
      title: "Time to hand those tasks off",
      body: "Schedule a no-strings introduction and discover what an AI Agent can do for your business.",
      cta: "Schedule an introduction",
    },
  },
} as const;

interface AIAgentsProps {
  lang: Lang;
}

const AIAgents = ({ lang }: AIAgentsProps) => {
  const t = COPY[lang];
  const bookingHref = "/pilot-program";

  return (
    <div className="min-h-screen page-bg">
      <SiteNav />

      {/* Hero */}
      <main className="container mx-auto px-4 hero-padding">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <motion.h1
            className="font-now font-extrabold tracking-tight leading-[1.15] text-[clamp(2rem,5vw,3.75rem)] bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t.hero.title}
          </motion.h1>
          <p className="text-base md:text-lg text-muted-foreground font-now font-light leading-relaxed">
            {t.hero.sub}
          </p>
          <div className="flex justify-center pt-2">
            <Button size="lg" asChild>
              <Link to={bookingHref}>
                {t.hero.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Problem recognition */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="font-now font-bold text-3xl md:text-4xl">{t.problem.title}</h2>
          <p className="text-muted-foreground font-now leading-relaxed text-base md:text-lg">
            {t.problem.body}
          </p>
        </div>
      </section>

      {/* Bridge */}
      <section className="container mx-auto px-4 pb-10">
        <p className="max-w-2xl mx-auto text-center font-now text-base md:text-lg text-foreground/80">
          {t.bridge}
        </p>
      </section>

      {/* Four-card grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.name} className="flex flex-col h-full">
                <CardHeader className="space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="font-now text-xl">{card.name}</CardTitle>
                  <p className="text-sm text-muted-foreground font-now leading-relaxed">
                    {card.promise}
                  </p>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="space-y-1 border-t border-border pt-4">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground font-now">{t.setupLabel}</span>
                      <span className="font-now font-semibold">
                        {t.from} {card.setup}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-muted-foreground font-now">{t.monthlyLabel}</span>
                      <span className="font-now font-semibold">
                        {t.from} {card.monthly}
                        {t.perMonth}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-now pt-2 leading-relaxed">
                      {t.priceNote}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={bookingHref}>{t.learnMore}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Catch-all */}
          <Card className="flex flex-col h-full border-dashed">
            <CardHeader className="space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <t.catchAll.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-now text-xl">{t.catchAll.name}</CardTitle>
              <p className="text-sm text-muted-foreground font-now leading-relaxed">
                {t.catchAll.promise}
              </p>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild className="w-full">
                <Link to={bookingHref}>{t.catchAll.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="font-now font-bold text-3xl md:text-4xl">{t.trust.title}</h2>
          <p className="text-muted-foreground font-now leading-relaxed text-base md:text-lg">
            {t.trust.body}
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="font-now font-bold text-3xl md:text-4xl text-center">
            {t.process.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.process.steps.map((step) => (
              <div key={step.n} className="space-y-2">
                <div className="text-sm font-now font-semibold text-primary">{step.n}</div>
                <div className="font-now font-semibold text-lg">{step.t}</div>
                <p className="text-sm text-muted-foreground font-now leading-relaxed">
                  {step.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-now font-bold text-3xl md:text-4xl">{t.closing.title}</h2>
          <p className="text-muted-foreground font-now text-base md:text-lg leading-relaxed">
            {t.closing.body}
          </p>
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link to={bookingHref}>
                {t.closing.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIAgents;
