import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, CheckCircle2, Users, TrendingUp, Target, Clock, Shield, Sparkles } from "lucide-react";
import { usePostHog } from "@/hooks/usePostHog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import campaignBuilderImage from "@/assets/campaign-builder-new.png";

const PilotPartner = () => {
  const {
    posthog
  } = usePostHog();
  const [showForm, setShowForm] = useState(false);
  const [spotsRemaining] = useState(7); // Update this as needed
  const [isEnglish, setIsEnglish] = useState(true);

  useEffect(() => {
    posthog.capture('pilot_page_viewed');
  }, [posthog]);
  useEffect(() => {
    // Load HubSpot form script
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const handleApplyClick = () => {
    posthog.capture('pilot_application_started');
    setShowForm(true);
  };
  useEffect(() => {
    if (showForm && (window as any).hbspt) {
      (window as any).hbspt.forms.create({
        region: "na1",
        portalId: "YOUR_PORTAL_ID",
        // Replace with your HubSpot portal ID
        formId: "YOUR_PILOT_FORM_ID",
        // Replace with your pilot form ID
        target: "#pilot-form-container",
        onFormSubmit: () => {
          posthog.capture('pilot_application_submitted');
        }
      });
    }
  }, [showForm, posthog]);
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-border">
              <Label htmlFor="language-switch" className="text-sm font-medium cursor-pointer">
                EN
              </Label>
              <Switch
                id="language-switch"
                checked={!isEnglish}
                onCheckedChange={(checked) => setIsEnglish(!checked)}
              />
              <Label htmlFor="language-switch" className="text-sm font-medium cursor-pointer">
                NL
              </Label>
            </div>
            <Button variant="ghost" asChild className="font-semibold">
              <Link to="/">{isEnglish ? "Home" : "Home"}</Link>
            </Button>
            <Button variant="ghost" asChild className="font-semibold">
              <Link to="/auth">{isEnglish ? "Sign In" : "Inloggen"}</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Section 1: Hero */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8">
          
          
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(2rem,6vw,4rem)]">
            {isEnglish ? "Let's improve recruitment." : "Recruitment advertising, maar dan slimmer."}
          </h1>
          
          <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-now max-w-3xl mx-auto">
            {isEnglish 
              ? "Be among the first 10 companies to Test, Rethink and Evolve recruitment advertising. No costs. Full support. Real impact."
              : "Sluit je aan bij onze eerste 10 pilotbedrijven en test de toekomst van job advertising. Zonder platformkosten en mét echte resultaten."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" variant="accent" className="text-foreground" asChild>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSezhcUt78O1jBEkLDAKYb9BnRT5p1Vks38n5LDViBMn0PY-Ew/viewform?usp=sharing&ouid=110010414237314376062" target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture('pilot_application_started')}>
                {isEnglish ? "Apply to Pilot Program" : "Meld je snel aan"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            
          </div>
        </div>
      </section>

      {/* Section 2: Problem + Vision */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              {isEnglish 
                ? "Why Recruitment Advertising Needs More Clarity"
                : "Waarom recruitment advertising meer duidelijkheid nodig heeft"}
            </h2>
            
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-now font-semibold text-foreground">
                {isEnglish ? "Too Slow" : "Te traag"}
              </h3>
              <p className="text-sm text-muted-foreground font-now">
                {isEnglish 
                  ? "Traditional campaign setup takes weeks, losing you top candidates to faster competitors"
                  : "Traditionele campagne-opzet duurt weken, waardoor je topkandidaten verliest aan snellere concurrenten"}
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-now font-semibold text-foreground">
                {isEnglish ? "No control" : "Geen controle"}
              </h3>
              <p className="text-sm text-muted-foreground font-now">
                {isEnglish 
                  ? "Agency markups and hidden fees make it hard to see where your money goes."
                  : "Bureau-opslagen en verborgen kosten maken het moeilijk om te zien waar je geld naartoe gaat."}
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-now font-semibold text-foreground">
                {isEnglish ? "No Real Insights" : "Geen echte inzichten"}
              </h3>
              <p className="text-sm text-muted-foreground font-now">
                {isEnglish 
                  ? "Without clear metrics, you can't optimize spend or prove hiring marketing effectiveness"
                  : "Zonder duidelijke metrics kun je uitgaven niet optimaliseren of de effectiviteit van wervingsmarketing bewijzen"}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl font-medium font-now">
              {isEnglish ? "There's a better way..." : "Er is een betere manier..."}
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Solution Snapshot */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              {isEnglish 
                ? "Meet 20/20: Recruitment Advertising Seen Clearly"
                : "Maak kennis met 20/20: Recruitment advertising helder in beeld"}
            </h2>
            <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
              {isEnglish 
                ? "Transform your advertising process with smart automation that changes how your organisation attracts talent."
                : "Transformeer je advertentieproces met slimme automatisering die verandert hoe jouw organisatie talent aantrekt."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">
                    {isEnglish 
                      ? "Launch Recruitment Campaigns in Minutes"
                      : "Start recruitment campagnes in minuten"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-now">
                    {isEnglish 
                      ? "No agencies, no waiting. Go from job posting to live campaign in under 10 minutes."
                      : "Geen bureaus, geen wachten. Van vacature naar live campagne in minder dan 10 minuten."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">
                    {isEnglish 
                      ? "Track Every Euro with full Transparency"
                      : "Volg elke euro met volledige transparantie"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-now">
                    {isEnglish 
                      ? "Your ad budget runs directly, with no markups, no prepayments, and complete transparency."
                      : "Je advertentiebudget wordt direct uitgegeven, zonder opslagen, zonder vooruitbetalingen en met volledige transparantie."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">
                    {isEnglish 
                      ? "Scale Without Extra Headcount"
                      : "Opschalen zonder extra personeel"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-now">
                    {isEnglish 
                      ? "Run multiple campaigns across platforms and business units, all managed without specialized advertising teams."
                      : "Voer meerdere campagnes uit over platforms en business units, allemaal beheerd zonder gespecialiseerde advertentieteams."}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img src={campaignBuilderImage} alt="Campaign Builder Interface" className="rounded-lg shadow-lg border border-primary/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Pilot Program Details */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              {isEnglish 
                ? "What You Get as a Pilot Partner"
                : "Wat je krijgt als pilotpartner"}
            </h2>
            <p className="text-lg text-muted-foreground font-now">
              {isEnglish 
                ? "Full transparency on benefits and expectations"
                : "Volledige transparantie over voordelen en verwachtingen"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 space-y-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-now font-semibold text-foreground text-lg">
                  {isEnglish ? "Your Benefits" : "Jouw voordelen"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-now">
                {isEnglish 
                  ? "What we provide to pilot partners"
                  : "Wat wij bieden aan pilotpartners"}
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Early access to platform before public launch"
                      : "Vroege toegang tot platform voor publieke lancering"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "No software costs during pilot period"
                      : "Geen softwarekosten tijdens pilotperiode"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Direct input on product development and features"
                      : "Directe input op productontwikkeling en features"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Dedicated onboarding and technical support"
                      : "Toegewijde onboarding en technische ondersteuning"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Preferred pricing when you transition to full subscription"
                      : "Voorkeurskorting bij overgang naar volledig abonnement"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Optional case study opportunity (with approval)"
                      : "Optionele case study mogelijkheid (met goedkeuring)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 space-y-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-now font-semibold text-foreground text-lg">
                  {isEnglish ? "Our Expectations" : "Onze verwachtingen"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-now">
                {isEnglish 
                  ? "What we ask from pilot partners"
                  : "Wat wij vragen van pilotpartners"}
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "1 to 2 months pilot commitment"
                      : "1 tot 2 maanden pilot commitment"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Active use of platform for recruitment campaigns"
                      : "Actief gebruik van platform voor recruitment campagnes"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Feedback sessions during this period"
                      : "Feedbacksessies tijdens deze periode"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Willingness to share web analytic results"
                      : "Bereidheid om webanalyse resultaten te delen"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Regular communication with product team"
                      : "Regelmatige communicatie met productteam"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">
                    {isEnglish 
                      ? "Covering own advertising spend, min €500,-"
                      : "Eigen advertentiekosten dekken, min. €500,-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </section>

      {/* Section 5: Strong CTA - Apply Now */}
      

      {/* Section 6: Social Proof & Credibility */}
      

      {/* Section 7: CTA Repetition + Urgency */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-primary/20">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium font-now">
              {isEnglish 
                ? `Only ${spotsRemaining} of 10 Pilot Spots Remaining`
                : `Nog maar ${spotsRemaining} van de 10 pilotplekken beschikbaar`}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
            {isEnglish 
              ? "Join the Next Step in Advertising"
              : "Doe mee aan de volgende stap in advertising"}
          </h2>

          <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
            {isEnglish 
              ? "We're limiting pilot participation to 10 companies to ensure each partner receives dedicated support and has meaningful impact on the product. Applications are reviewed on a first-come, first-served basis."
              : "We beperken de pilotdeelname tot 10 bedrijven om ervoor te zorgen dat elke partner toegewijde ondersteuning krijgt en betekenisvolle impact heeft op het product. Aanmeldingen worden beoordeeld op basis van wie het eerst komt, het eerst maalt."}
          </p>

          <div className="pt-4">
            <Button size="lg" variant="accent" className="text-foreground" asChild>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSezhcUt78O1jBEkLDAKYb9BnRT5p1Vks38n5LDViBMn0PY-Ew/viewform?usp=sharing&ouid=110010414237314376062" target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture('pilot_application_started')}>
                {isEnglish ? "Apply to Pilot Program Now" : "Meld je nu aan voor het pilotprogramma"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground font-now">
            {isEnglish 
              ? "Application review takes 1-2 business days"
              : "Beoordeling van aanmelding duurt 1-2 werkdagen"}
          </p>
        </div>
      </section>

      {/* Section 8: FAQ */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              {isEnglish 
                ? "Frequently Asked Questions"
                : "Veelgestelde vragen"}
            </h2>
            <p className="text-lg text-muted-foreground font-now">
              {isEnglish 
                ? "Everything you need to know about the pilot program"
                : "Alles wat je moet weten over het pilotprogramma"}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-now">
                {isEnglish 
                  ? "What happens after I apply?"
                  : "Wat gebeurt er nadat ik me heb aangemeld?"}
              </AccordionTrigger>
              <AccordionContent className="font-now">
                {isEnglish 
                  ? "After submitting your application, our team will review it within 1–2 business days. If selected, we'll schedule a 30-minute kickoff call to discuss your recruitment needs, timeline, and how 20/20 can best support your goals during the pilot."
                  : "Nadat je je aanmelding hebt ingediend, beoordeelt ons team deze binnen 1-2 werkdagen. Als je wordt geselecteerd, plannen we een 30 minuten durend kickoff gesprek om je wervingsbehoeften, tijdlijn en hoe 20/20 je doelen tijdens de pilot het beste kan ondersteunen te bespreken."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-now">
                {isEnglish 
                  ? "Is there any cost during the pilot?"
                  : "Zijn er kosten tijdens de pilot?"}
              </AccordionTrigger>
              <AccordionContent className="font-now">
                {isEnglish 
                  ? "No. There are no software fees during the pilot period. You will only need to cover your own advertising spend on Meta, which you control directly. This is the same spend you would have with any recruitment advertising approach."
                  : "Nee. Er zijn geen softwarekosten tijdens de pilotperiode. Je hoeft alleen je eigen advertentiekosten op Meta te dekken, die je direct beheert. Dit zijn dezelfde kosten die je zou hebben bij elke recruitment advertising aanpak."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-now">
                {isEnglish 
                  ? "What's expected of pilot partners?"
                  : "Wat wordt er verwacht van pilotpartners?"}
              </AccordionTrigger>
              <AccordionContent className="font-now">
                {isEnglish 
                  ? "We ask for active platform usage, monthly 1-hour feedback sessions, and willingness to share anonymized results. Your input directly shapes product development. There's no obligation to continue after the pilot ends."
                  : "We vragen om actief platformgebruik, maandelijkse 1-uurs feedbacksessies en bereidheid om geanonimiseerde resultaten te delen. Jouw input vormt direct de productontwikkeling. Er is geen verplichting om door te gaan na afloop van de pilot."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-now">
                {isEnglish 
                  ? "Can I stop participating?"
                  : "Kan ik stoppen met deelnemen?"}
              </AccordionTrigger>
              <AccordionContent className="font-now">
                {isEnglish 
                  ? "Yes. While we ask for a 1–2 month commitment, you can exit the pilot at any time if it's not meeting your needs. We simply ask for feedback on why it wasn't a fit so we can continue to improve."
                  : "Ja. Hoewel we vragen om een commitment van 1-2 maanden, kun je de pilot op elk moment verlaten als deze niet aan je behoeften voldoet. We vragen alleen om feedback waarom het niet paste, zodat we kunnen blijven verbeteren."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-now">
                {isEnglish 
                  ? "Will my data be shared?"
                  : "Worden mijn gegevens gedeeld?"}
              </AccordionTrigger>
              <AccordionContent className="font-now">
                {isEnglish 
                  ? "No. Your company data and campaign information remain confidential. We may ask to share anonymized, aggregated results in case studies, but only with your explicit written approval. You maintain full control over what can be shared publicly."
                  : "Nee. Je bedrijfsgegevens en campagne-informatie blijven vertrouwelijk. We kunnen vragen om geanonimiseerde, geaggregeerde resultaten te delen in casestudy's, maar alleen met je expliciete schriftelijke goedkeuring. Je behoudt volledige controle over wat publiekelijk kan worden gedeeld."}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left font-now">
                {isEnglish 
                  ? "What company size are you looking for?"
                  : "Welke bedrijfsgrootte zoeken jullie?"}
              </AccordionTrigger>
              <AccordionContent className="font-now">
                {isEnglish 
                  ? "We're looking for in-house recruitment teams of all sizes, especially those hiring 10+ people per year for recurring or volume roles. These teams want to manage their recruitment advertising directly and rely less on agencies or ineffective processes."
                  : "We zoeken interne recruitment teams van alle groottes, vooral degenen die 10+ mensen per jaar aannemen voor terugkerende of volume rollen. Deze teams willen hun recruitment advertising direct beheren en minder afhankelijk zijn van bureaus of ineffectieve processen."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-sm text-muted-foreground font-now">
                © 2025 20/20 Solutions. {isEnglish ? "All rights reserved." : "Alle rechten voorbehouden."}
              </span>
            </div>
            <div className="flex gap-6 text-sm font-now">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                {isEnglish ? "Sign In" : "Inloggen"}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* HubSpot Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-now">
              {isEnglish 
                ? "Apply for Pilot Partner Program"
                : "Aanmelden voor pilotprogramma"}
            </DialogTitle>
          </DialogHeader>
          <div id="pilot-form-container" className="py-4"></div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default PilotPartner;