# Homepage rewrite: TTS als AI-partner voor MKB

## Scope
- Vervang `/` (Index.tsx) volledig met nieuwe 9-secties opzet.
- Nieuwe sticky `PublicNav` met Diensten/Producten dropdowns, Cases, Over ons, Contact, NL/EN switch en "Plan een kennismaking" CTA.
- Nieuwe `PublicFooter` (4 kolommen, NL/EN bottom toggle).
- NL/EN via `react-i18next`. Default NL, persist in localStorage.
- Andere pagina's blijven recruitment-gericht. Nav wordt op de homepage gebruikt; ik raak andere pagina's niet aan.
- CTA "Plan een kennismaking" opent de bestaande HubSpot demo-dialog (zelfde portal/form id als nu in `Index.tsx`).
- Memory updaten: oude regels die conflicteren (recruitment positionering, "Top Up" hide, demo conversion flow) blijven waar relevant; nieuwe regels voor TTS positionering en nav opzet.

## Secties (in volgorde)
1. `HeroSection`: eyebrow, H1, sub, primary + ghost CTA, abstract animated terminal-mockup rechts.
2. `SocialProofSection`: caption + marquee met logo-placeholders (Stichting Infra Talenten + 4 grijze blokken).
3. `PainPointsSection`: 6 kaarten, 2 kolommen desktop.
4. `TwoPillarsSection`: 2 grote kaarten Producten vs Diensten.
5. `ServicesSection`: 4 genummerde diensten met tags en mini UI-window rechts.
6. `ProcessSection`: 4 stappen, horizontale lijn desktop / vertikaal mobile.
7. `CasesSection`: 3 case-kaarten (Stichting Infra Talenten + 2 placeholders).
8. `UrgencySection`: 3 blokken.
9. `CTASection`: headline, 2 knoppen, trust signals.

Plus `PublicNav`, `PublicFooter`.

## i18n opzet
- Installeer `react-i18next` + `i18next`.
- `src/i18n/index.ts`: init met nl + en resources, namespace `home`, fallback nl, taal uit `localStorage.tts_lang`.
- `src/i18n/locales/nl.json` en `en.json` met alle homepage + nav + footer strings.
- `LanguageToggle` component (NL | EN) gebruikt `i18n.changeLanguage` + persist.

## Design
- Donkere achtergrond (hergebruik bestaande `.page-bg` / `bg-background`).
- Accentkleur = bestaande `--primary`. Alleen primaire CTA gebruikt deze.
- Typography: bestaande NOW (Inter) familie. Headlines `text-5xl md:text-7xl font-bold tracking-tight`.
- Generous spacing (`py-32 md:py-40` tussen secties).
- Framer-motion fade-in: `initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}}`.
- Subtiele dot-grid achtergrond in hero via inline SVG of `bg-[radial-gradient]`.
- Animated terminal: simpel typewriter effect met framer-motion / setInterval, 4-5 regels.

## Copy regels
- Geen em-dashes (—) in zichtbare copy. Gebruik punt, dubbele punt, of komma.
- Exacte teksten uit prompt overnemen.

## Technisch
- Nieuwe map `src/components/home-v2/` voor alle nieuwe homepage componenten zodat oude `src/components/home/*` (HowItWorks, NewsInsights, HomeFAQ) intact blijft voor andere pagina's die deze importeren.
- `src/pages/Index.tsx` volledig vervangen door nieuwe samenstelling.
- `App.tsx`: import `'./i18n'` toevoegen.
- Meta tags: `react-helmet-async` (al beschikbaar checken) of update `index.html` title/description.
- HubSpot dialog state via React Context (`DemoDialogContext`) zodat nav-knop en sectie-knoppen dezelfde dialog openen.

## Verificatie
- `browser--view_preview /` om hero te checken.
- Mobile viewport 375 check.
- Console logs check op i18n init errors.

## Out of scope
- Aanpassen van /pricing, /meta-job-ads, /tiktok-job-ads, /solution, /blog enz.
- Echte cases-pagina / over-ons / contact pagina bouwen. Nav-links daarheen kunnen voorlopig naar `#` of bestaande routes.
- Vertalen van overige pagina's naar EN.
