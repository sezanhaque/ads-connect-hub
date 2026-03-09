import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Logo from "@/components/ui/logo";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Check, Shield, Layers, TrendingUp, ArrowRight, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { posthog } from "@/lib/posthog";

const navLinks = [
  { to: "/platform-overview", label: "Product" },
  { to: "/pricing", label: "Pricing" },
  { to: "/become-partner", label: "Become a partner" },
  { to: "/blog", label: "Blog" },
];

const principles = [
  {
    icon: Layers,
    title: "Zelfde features overal",
    description: "Elke klant krijgt het volledige platform. Geen feature-beperkingen.",
  },
  {
    icon: TrendingUp,
    title: "Prijs schaalt met volume",
    description: "1 campagne = 1 vacature × 1 locatie. Meer campagnes = hoger pakket.",
  },
  {
    icon: Shield,
    title: "0% marge op advertentiebudget",
    description: "Je advertentiebudget gaat 100% via je eigen advertentieaccount. Wij raken het niet aan.",
  },
];

const allFeatures = [
  "Meta campagnes (Facebook + Instagram)",
  "TikTok campagnes",
  "Eigen advertentieaccount",
  "Realtime kosten-per-sollicitatie dashboard",
  "ATS integratie (iFrame)",
  "Multi-user toegang",
  "GDPR / AVG compliant",
];

const plans = [
  {
    name: "Solo",
    subtitle: "Perfect voor starters en werkgevers",
    campaigns: "1–3",
    price: "€199",
    period: "/maand",
    setup: "€0 setup",
    term: "Maandelijks opzegbaar",
    extra: "€79/maand per extra campagne",
    support: ["E-mail support", "30 min onboarding call", "48u reactietijd"],
    cta: "Start nu",
    ctaVariant: "default" as const,
    popular: false,
  },
  {
    name: "Team",
    subtitle: "Voor groeiende bureaus en HR-afdelingen",
    campaigns: "4–10",
    price: "€399",
    period: "/maand",
    setup: "€249 eenmalige setup",
    term: "Minimaal 6 maanden",
    extra: "€79/maand per extra campagne",
    support: ["Alles van Solo", "Prioriteit support (telefoon + chat)", "1 uur onboarding", "24u reactietijd"],
    cta: "Aan de slag",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Business",
    subtitle: "Voor gevestigde bureaus en corporates",
    campaigns: "11–25",
    price: "€649",
    period: "/maand",
    setup: "€499 eenmalige setup",
    term: "Minimaal 12 maanden",
    extra: "€79/maand per extra campagne",
    support: ["Alles van Team", "Dedicated success manager", "2 uur onboarding", "8u reactietijd"],
    cta: "Aan de slag",
    ctaVariant: "default" as const,
    popular: false,
  },
  {
    name: "Scale",
    subtitle: "Voor enterprise en grote operaties",
    campaigns: "25+",
    price: "Op maat",
    period: "",
    setup: "Setup op maat",
    term: "Contractduur op maat",
    extra: "Campagnes op maat",
    support: ["Alles van Business", "Kwartaal business review", "Custom onboarding", "4u reactietijd"],
    cta: "Neem contact op",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

const costExamples = [
  {
    label: "Kleine werkgever",
    detail: "1 vacature, 1 locatie",
    platform: "€199",
    adSpend: "~€400",
    total: "€599",
  },
  {
    label: "Groeiend bureau",
    detail: "6 vacatures, 2 locaties = 8 campagnes",
    platform: "€399",
    adSpend: "~€3.200",
    total: "€3.599",
  },
  {
    label: "Groot bureau",
    detail: "15 vacatures, meerdere locaties = 20 campagnes",
    platform: "€649",
    adSpend: "~€8.000",
    total: "€8.649",
  },
];

const comparisonRows = [
  { metric: "Kosten voor 5 vacatures", tt: "~€2.199/mnd", indeed: "€2.500–7.500/mnd", agency: "€50.000–125.000" },
  { metric: "Bereikt passieve kandidaten", tt: "Ja", indeed: "Nee", agency: "Soms" },
  { metric: "Realtime kosten-per-sollicitatie", tt: "Ja", indeed: "Beperkt", agency: "Nee" },
  { metric: "Volledige transparantie", tt: "100%", indeed: "Gedeeltelijk", agency: "Nee" },
  { metric: "ATS integratie", tt: "Ja, op elk niveau", indeed: "Beperkt", agency: "Wisselend" },
];

const faqItems = [
  { q: "Wat telt als 1 campagne?", a: "1 vacature × 1 locatie = 1 campagne. Een vacature in 2 steden = 2 campagnes. Drie verschillende rollen in één stad = 3 campagnes." },
  { q: "Nemen jullie een percentage van mijn advertentiebudget?", a: "Nee. Je advertentiebudget gaat 100% via je eigen Meta of TikTok advertentieaccount. Wij nemen nul procent marge. Onze inkomsten komen uitsluitend uit het platformabonnement." },
  { q: "Wat als ik meer campagnes nodig heb dan mijn pakket toestaat?", a: "Elke extra campagne kost €79/maand. Als je structureel meer nodig hebt, is upgraden naar het volgende pakket meestal voordeliger." },
  { q: "Welke ATS-systemen koppelen jullie?", a: "We integreren via iFrame met alle gangbare ATS-systemen waaronder Bullhorn, Carerix, Recruitee, Greenhouse, MySolution en Loxo. Integratie is inbegrepen op elk pakket zonder meerkosten." },
  { q: "Hoeveel advertentiebudget heb ik nodig?", a: "Wij adviseren €300–500 per campagne per maand. Je bepaalt zelf je budget en kunt dit op elk moment aanpassen." },
  { q: "Kan ik eerst uitproberen?", a: "Ja. Vraag naar ons gratis pilotprogramma: 1 campagne, 1 maand, je betaalt alleen je eigen advertentiebudget. Wij laten je echte resultaten zien voordat je beslist." },
  { q: "Wat is het verschil tussen de pakketten?", a: "De features zijn op elk pakket identiek. Het enige verschil is het aantal actieve campagnes en het niveau van support dat je ontvangt." },
  { q: "Wat is de contractduur?", a: "Solo is maandelijks opzegbaar. Team minimaal 6 maanden. Business minimaal 12 maanden. Scale op maat." },
];

const Pricing = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDemoRequest = () => {
    posthog.capture("demo_requested_pricing");
    setIsFormOpen(true);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-eu1.hsforms.net/forms/embed/147002455.js";
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button onClick={handleDemoRequest} className="hidden md:inline-flex">
              Plan jouw demo
            </Button>
            <MobileNav onDemoClick={handleDemoRequest} links={navLinks} />
          </div>
        </nav>
      </header>

      {/* SECTION 1: Hero */}
      <section className="container mx-auto px-4 pt-12 md:pt-20 pb-12 text-center">
        <motion.h1
          className="font-now font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-tight bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Transparante prijzen. Geen verborgen kosten.
        </motion.h1>
        <motion.p
          className="mt-4 text-lg text-muted-foreground font-now max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Vol functionaliteit op elk niveau. Prijs schaalt alleen met het aantal actieve campagnes.
        </motion.p>

        {/* Trust badges */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4 md:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {["0% marge op advertentiebudget", "ATS integratie op elk niveau", "Eigen advertentieaccount per klant"].map((badge) => (
            <div key={badge} className="flex items-center gap-2 bg-muted rounded-full px-4 py-2 text-sm font-now font-medium text-foreground">
              <Check className="h-4 w-4 text-primary" />
              {badge}
            </div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 2: Three Principles */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              className="text-center p-6 rounded-xl border bg-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="font-now font-bold text-lg mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground font-now">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-now font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> Meest gekozen
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-now">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground font-now">{plan.subtitle}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-now font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground font-now text-sm">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-now mt-1">{plan.campaigns} actieve campagnes</p>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground font-now mb-6">
                  <p>{plan.setup}</p>
                  <p>{plan.term}</p>
                  <p>{plan.extra}</p>
                </div>

                {/* Features — identical on every card */}
                <div className="border-t pt-4 mb-4">
                  <p className="text-xs font-now font-bold text-foreground mb-3 uppercase tracking-wide">Features</p>
                  <ul className="space-y-2">
                    {allFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm font-now">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support */}
                <div className="border-t pt-4 mb-6">
                  <p className="text-xs font-now font-bold text-foreground mb-3 uppercase tracking-wide">Support</p>
                  <ul className="space-y-2">
                    {plan.support.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm font-now">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <Button
                    variant={plan.ctaVariant}
                    className="w-full font-now font-semibold"
                    onClick={plan.ctaVariant === "outline" ? handleDemoRequest : undefined}
                    asChild={plan.ctaVariant !== "outline"}
                  >
                    {plan.ctaVariant === "outline" ? (
                      <span>{plan.cta}</span>
                    ) : (
                      <Link to="/pilot-program">
                        {plan.cta} <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 4: Wat betaal je echt? */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="font-now font-extrabold text-2xl md:text-3xl">Volledige transparantie — geen verrassingen</h2>
          <p className="text-muted-foreground font-now mt-2 max-w-xl mx-auto">
            Wat betaal je écht? Hier zijn realistische voorbeelden inclusief advertentiebudget.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {costExamples.map((ex) => (
            <Card key={ex.label} className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-now">{ex.label}</CardTitle>
                <p className="text-xs text-muted-foreground font-now">{ex.detail}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm font-now">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">{ex.platform}/mnd</span>
                </div>
                <div className="flex justify-between text-sm font-now">
                  <span className="text-muted-foreground">Advertentiebudget</span>
                  <span className="font-medium">{ex.adSpend}/mnd</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-sm font-now font-bold">
                  <span>Totaal</span>
                  <span className="text-primary text-lg">{ex.total}/mnd</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-now text-center mt-6 max-w-2xl mx-auto">
          Wij adviseren €300–500 per campagne per maand aan advertentiebudget voor optimale resultaten. Dit budget gaat direct via jouw eigen advertentieaccount — wij nemen 0% marge.
        </p>
      </section>

      {/* SECTION 5: Vergelijking */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-now font-extrabold text-2xl md:text-3xl text-center mb-10">
          Hoe vergelijken wij?
        </h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm font-now">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-bold text-foreground"></th>
                <th className="py-3 px-4 font-bold text-primary">TwentyTwenty</th>
                <th className="py-3 px-4 font-bold text-muted-foreground">Indeed Sponsored</th>
                <th className="py-3 px-4 font-bold text-muted-foreground">Werving & Selectie</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.metric} className="border-b">
                  <td className="py-3 px-4 font-medium text-foreground">{row.metric}</td>
                  <td className="py-3 px-4 text-center font-semibold text-primary">{row.tt}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{row.indeed}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{row.agency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 6: FAQ */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="font-now font-extrabold text-2xl md:text-3xl text-center mb-10">
          Veelgestelde vragen
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="font-now font-medium text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="font-now text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* SECTION 7: Final CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-now font-extrabold text-2xl md:text-3xl mb-4">
          Klaar om recruitment simpel, transparant en schaalbaar te maken?
        </h2>
        <p className="text-muted-foreground font-now mb-8 max-w-lg mx-auto">
          Plan een vrijblijvende demo en ontdek hoe TwentyTwenty jouw recruitment transformeert.
        </p>
        <Button size="lg" onClick={handleDemoRequest}>
          Plan jouw gratis demo
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Demo Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan jouw demo</DialogTitle>
          </DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Pricing;
