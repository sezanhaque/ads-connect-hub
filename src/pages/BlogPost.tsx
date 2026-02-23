import { Link, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowLeft, Calendar, Clock, User, Share2, Linkedin, Twitter, Facebook, Link as LinkIcon, Check } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

// FAQ data type
interface FAQItem {
  question: string;
  answer: string;
}

// Blog posts data - will be moved to a CMS or database later
export const blogPostsData: Record<string, {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  content: React.ReactNode;
  faqs: FAQItem[];
}> = {
  "should-you-use-advertising-for-recruitment": {
    id: "should-you-use-advertising-for-recruitment",
    title: "Should You Use Advertising for Recruitment?",
    excerpt: "Recruitment has become a visibility challenge. If your hiring goals depend on consistent applicant flow, advertising is no longer optional — it is a strategic extension of talent acquisition.",
    author: "Our team",
    date: "February 23, 2026",
    readTime: "4 min read",
    category: "Strategy",
    faqs: [
      {
        question: "Should I advertise every vacancy?",
        answer: "Not necessarily. Advertising is most effective for recurring roles, competitive markets, or when organic reach does not generate enough qualified applicants."
      },
      {
        question: "Does social media advertising improve applicant volume?",
        answer: "Yes. Platforms like Meta and TikTok increase visibility among both active and passive candidates, leading to more predictable inflow."
      },
      {
        question: "Is recruitment advertising expensive?",
        answer: "It becomes expensive when unmanaged. When structured and optimized, it provides measurable cost per applicant and cost per hire, giving full budget control."
      },
      {
        question: "Can recruitment advertising be automated?",
        answer: "Yes. With Twenty Twenty Solutions, campaigns can be launched, optimized, and connected to your ATS automatically, reducing manual workload while maintaining performance."
      }
    ],
    content: (
      <>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Recruitment has become a visibility challenge. Candidates compare opportunities across multiple platforms and spend more time on social media than on job boards. Yet many organizations still rely mainly heavily on organic vacancy traffic.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          If your hiring goals depend on consistent applicant flow, advertising is no longer optional. It is a strategic extension of talent acquisition. The question is not whether advertising replaces recruitment strategy, but whether your recruitment strategy includes controlled visibility.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Why Organic Reach Is No Longer Enough</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Job boards and career pages only reach active job seekers. A large part of the workforce is passive. They are open to opportunities but not actively searching.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Platforms such as Meta and TikTok allow you to reach these candidates directly. Instead of waiting for traffic, you place your vacancy in front of the right audience based on location, interests, and behavior. For organizations with recurring hiring needs, this creates predictability. Advertising transforms recruitment from hope-based exposure into measurable reach.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Advertising as the Performance Layer of Talent Acquisition</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Advertising does not replace employer branding, workforce planning, or candidate experience. It strengthens them.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          When campaigns are structured correctly, you gain insight into cost per applicant, cost per hire, and channel effectiveness. Recruitment budgets become controllable. Decisions become data driven. Hiring becomes scalable and now-a-days even completely automated. In competitive labor markets, the companies that actively promote their vacancies consistently outperform those that rely only on organic visibility.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">From Campaigns to Control</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Recruitment advertising only works when it is structured and connected to outcomes. Random boosts or short experiments rarely create sustainable results.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          High-performing teams run continuous campaigns for recurring roles, align targeting with geography and job requirements, and connect advertising data directly to their ATS. This creates full funnel insight from click to hire.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          At Twenty Twenty Solutions, we automate recruitment advertising for organizations that want performance without complexity. Our platform connects campaigns directly to your ATS, provides clear dashboards focused on cost and results, and uses AI to optimize targeting and bidding in the background. Recruitment advertising is no longer a marketing experiment. For growth-focused organizations, it is a strategic driver of consistent hiring results.
        </p>
      </>
    )
  },
  "salary-transparency-vacancy": {
    id: "salary-transparency-vacancy",
    title: "Why Not Listing a Salary in Your Vacancy Costs You Trust",
    excerpt: "Nearly 40% of candidates assume a company is a poor payer when no salary is mentioned. Even before reading the rest of the vacancy, trust is already damaged.",
    author: "Our team",
    date: "February 10, 2026",
    readTime: "4 min read",
    category: "Best Practices",
    faqs: [
      {
        question: "Should you include salary in a job vacancy?",
        answer: "Yes. Including salary in a job vacancy increases trust and improves application quality. Research shows that many candidates interpret missing salary information as a sign of poor compensation. Transparent salary ranges help attract candidates who are genuinely aligned with the role."
      },
      {
        question: "Does listing a salary improve recruitment advertising results?",
        answer: "In most cases, yes. Vacancies with salary information tend to achieve higher conversion rates, lower cost per applicant, and better candidate quality. Salary clarity reduces uncertainty, which is critical in performance-based recruitment advertising."
      },
      {
        question: "What if the salary depends on experience or negotiation?",
        answer: "You can still include a salary range. Mentioning a minimum and maximum salary, combined with a short explanation (for example, based on experience or seniority), sets expectations without limiting flexibility. This approach is far more effective than leaving salary out entirely."
      }
    ],
    content: (
      <>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Transparency has become a defining factor in modern recruitment. Candidates compare roles faster, across more channels, and with higher expectations than ever before. Yet one element is still frequently missing from job descriptions and vacancy texts: salary.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Recent research shows that nearly 40% of candidates assume a company is a poor payer when no salary is mentioned. Even before reading the rest of the vacancy, trust is already damaged. In recruitment advertising, perception matters. And silence sends a message.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">What Candidates Really Think When Salary Is Missing</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          From a candidate's perspective, the absence of salary information in a vacancy creates uncertainty. That uncertainty is often interpreted negatively.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">Common assumptions include:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
          <li>The salary is below market level</li>
          <li>The employer is not transparent</li>
          <li>Negotiation will be difficult or one-sided</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This doesn't just reduce application volume. It affects who applies. Strong, experienced candidates are more likely to opt out early, while less suitable candidates may still apply. The result: lower quality applications and more time lost in screening.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Why Salary Transparency Matters in Recruitment Advertising</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          In performance-driven recruitment advertising, every click has a cost. When salary expectations are unclear, conversion rates drop.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          You pay for reach and traffic via platforms like social media and job ads, but hesitation at the vacancy level prevents candidates from applying. This increases cost per applicant and reduces campaign efficiency. Including a salary range in a job description acts as a natural filter. It improves relevance, attracts candidates with the right expectations, and leads to higher-quality applications.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Transparency Builds Trust Before the First Click</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Salary transparency is not about locking yourself into a single number. It is about setting clear expectations early in the hiring process.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">High-performing vacancy texts typically:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
          <li>Include a realistic salary range</li>
          <li>Explain how compensation grows with experience or performance</li>
          <li>Align salary with role responsibilities and market standards</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This allows candidates to quickly assess whether a role fits their situation. Fewer doubts lead to higher intent and better conversion.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">From Better Job Descriptions to Better Hiring Results</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Recruitment advertising works best when messaging, targeting, and expectations are aligned. Salary transparency supports all three.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          It strengthens employer branding, improves candidate trust, and makes recruitment advertising budgets more effective. Especially in competitive labor markets, clarity in job postings is not optional. It directly impacts performance. At Twenty Twenty Solutions, we consistently see that vacancies with clear, honest information outperform those that leave candidates guessing.
        </p>
      </>
    )
  },
  "realistic-recruitment-advertising": {
    id: "realistic-recruitment-advertising",
    title: "Why Realistic Recruitment Advertising Is Becoming a Strategic Necessity",
    excerpt: "Many HR teams experience a disconnect between attraction and retention. Application volumes may be high, but early drop-off and short tenure remain persistent challenges.",
    author: "Our team",
    date: "February 2, 2026",
    readTime: "4 min read",
    category: "Industry Insights",
    faqs: [
      {
        question: "Why does realistic recruitment advertising reduce early-stage turnover?",
        answer: "Because candidates enter the hiring process with a more accurate understanding of the role and environment, reducing the gap between expectation and reality once they start."
      },
      {
        question: "Does realistic content negatively impact application volume?",
        answer: "It can reduce volume, but it typically improves relevance and fit, which leads to more efficient hiring outcomes overall."
      },
      {
        question: "Is realistic recruitment content less effective on social platforms?",
        answer: "No. When executed properly, realistic recruitment content can perform very well on social platforms. Content that reflects real situations, real people, and real work environments often drives stronger relevance, trust, and engagement."
      },
      {
        question: "Can I create content with AI within Twenty Twenty Solutions?",
        answer: "Yes. Twenty Twenty Solutions supports AI-assisted content creation to help teams structure and adapt recruitment messaging efficiently."
      }
    ],
    content: (
      <>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Recruitment advertising has become easier to scale, faster to deploy, and more automated than ever before. Social platforms, video formats, and performance-driven tooling allow organizations to reach large audiences with relatively little effort.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Yet many HR teams and business leaders are experiencing a growing disconnect between attraction and retention. Application volumes may be high, but early drop-off and short tenure remain persistent challenges. This issue is rarely caused by a lack of reach or budget. More often, it is the result of misaligned expectations created early in the recruitment process.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">When Attraction Creates the Wrong Expectations</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          A significant portion of recruitment advertising still presents an idealized version of the workplace. Carefully selected visuals, optimistic messaging, and abstract descriptions of culture or growth opportunities are used to position roles as broadly appealing. While this approach can be effective in driving interest, it often lacks context about the actual working environment, pace, and demands of the role.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          When candidates enter an organization and discover that daily reality differs from what was communicated, engagement declines quickly. The result is a familiar pattern: strong inflow, followed by early exits. If people are attracted based on a distorted or incomplete picture, they tend to disengage just as quickly once that picture no longer holds.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Realism as a Structural Filter in Hiring</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Realistic recruitment advertising is not about lowering ambition or reducing appeal. It functions as a filter rather than a funnel. By clearly communicating what a role entails, organizations allow candidates to assess fit before applying, rather than after starting.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This approach often leads to fewer applications, but those applications tend to be more relevant. Conversations during interviews become more concrete, onboarding friction is reduced, and new hires integrate more smoothly into teams. For HR and recruitment teams, this means spending less time correcting mismatches later in the process. For leadership, it translates into improved retention and more stable teams.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Content That Reflects the Actual Work Environment</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Realism is best conveyed through content that shows context rather than aspiration. Formats such as short "day in the life" impressions, employees explaining their roles in their own words, or job ads that describe challenges alongside benefits help candidates understand what working in a role truly looks like.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          These formats do not aim to maximize reach or engagement metrics, but to provide clarity. When used consistently, this type of content shifts recruitment advertising away from persuasion and toward expectation management.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Why This Matters Now</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          As recruitment processes become more automated and candidate decision cycles shorten, tolerance for ambiguity continues to decrease. Candidates are better informed and quicker to disengage when expectations are not met.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Organizations that invest in realistic recruitment advertising may attract fewer applicants, but they tend to hire people who stay longer, perform better, and integrate faster. In the current labor market, clarity has become a competitive advantage.
        </p>
      </>
    )
  },
  "aligning-hr-recruitment-marketing": {
    id: "aligning-hr-recruitment-marketing",
    title: "Aligning HR, Recruitment, and Marketing Through Advertising Automation",
    excerpt: "Recruitment advertising almost never lives with one team. Advertising automation becomes truly valuable when it is used to connect these roles instead of separating them further.",
    author: "Our team",
    date: "January 30, 2026",
    readTime: "4 min read",
    category: "Strategy",
    faqs: [
      {
        question: "Why is alignment between HR, recruitment, and marketing so difficult in practice?",
        answer: "Each team traditionally works with its own tools, metrics, and priorities. HR focuses on workforce needs, recruitment on candidate flow, and marketing often on supporting commercial tasks. Without a shared structure and data layer, these perspectives naturally drift apart, creating friction rather than collaboration."
      },
      {
        question: "How does advertising automation help improve alignment?",
        answer: "Automation helps by standardizing how campaigns are set up, measured, and evaluated. When objectives, structures, and metrics are predefined and consistent, teams can work from the same assumptions and data, reducing manual interpretation and misalignment."
      },
      {
        question: "Does automation reduce control over recruitment advertising?",
        answer: "No. When implemented correctly, automation increases control. Routine execution is handled systematically, while teams gain clearer oversight into performance, costs, and outcomes, allowing them to focus on strategic decisions rather than operational tasks."
      },
      {
        question: "How does Twenty Twenty Solutions support this approach?",
        answer: "Twenty Twenty Solutions provides a centralized platform for recruitment advertising, combining structured campaign setup, clear performance insights, and integrations with selected ATS systems. This helps HR, recruitment, and marketing teams operate from a shared framework and maintain clarity as hiring scales."
      }
    ],
    content: (
      <>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Recruitment advertising almost never lives with one team.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          HR defines hiring needs and priorities. Recruitment manages vacancies and candidate flow. Marketing understands channels, optimization, and performance logic. Each role is essential, yet in practice these disciplines often operate in parallel rather than as a single system. The result is not a lack of activity, but a lack of clarity: campaigns run, data exists, but ownership, alignment, and insight are fragmented.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Advertising automation becomes truly valuable when it is used to connect these roles instead of separating them further.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Where Misalignment Creates Friction</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Most inefficiencies in recruitment advertising are structural. Campaigns take longer to launch because information moves between teams. Performance discussions become reactive because data lives in multiple tools. Follow-up speed suffers because advertising activity is disconnected from recruitment workflows.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          These issues are rarely caused by people or effort. They are the natural outcome of fragmented processes. When HR, recruitment, and marketing work with different objectives, definitions of success, and systems, optimization becomes slow and inconsistent. Advertising turns into execution rather than a controllable process.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Automation as a Shared Framework</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Advertising automation should not be seen as a way to replace decision-making, but as a way to standardize it.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          When campaign structures, objectives, and performance metrics are clearly defined upfront, automation helps enforce consistency. It removes repetitive manual steps, reduces interpretation differences between teams, and creates a single source of truth for performance. This allows discussions to shift from opinions to data, and from short-term fixes to long-term improvement.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The key is not how much is automated, but whether automation supports understanding.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">From Execution to Control</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          In well-aligned teams, automation moves the focus away from daily execution and toward oversight. Routine tasks such as structuring campaigns, pacing budgets, and handling optimization logic run in the background.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          This balance makes recruitment advertising scalable. Growth no longer depends on adding more manual work, but on maintaining clarity as volume increases.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          At Twenty Twenty Solutions, we approach advertising automation as an enabler of alignment. By centralizing campaign setup, performance insights, and integrations with selected ATS systems, we help HR, recruitment, and marketing teams work from the same objectives and data. This creates a shared process where advertising becomes transparent, measurable, and easier to manage at scale.
        </p>
      </>
    )
  },
  "5-common-mistakes-recruitment-advertising": {
    id: "5-common-mistakes-recruitment-advertising",
    title: "5 Common Mistakes in Recruitment Advertising",
    excerpt: "Recruitment advertising has become a core pillar of modern hiring strategies. Yet despite powerful tools, many campaigns still underperform. Here are five common mistakes and why addressing them matters.",
    author: "Our team",
    date: "January 29, 2026",
    readTime: "4 min read",
    category: "Best Practices",
    faqs: [
      {
        question: "What are some important metrics in recruitment advertising?",
        answer: "While impressions and clicks provide useful context, they rarely tell the full story. More meaningful metrics include cost per applicant and application completion rate. With integrations to selected ATS systems, Twenty Twenty Solutions helps teams measure the full recruitment funnel, from ad to applicant and gain clearer insight into performance."
      },
      {
        question: "How can I align my team so the campaign objective is clear for everyone?",
        answer: "Clear alignment starts with defining a single primary objective before a campaign goes live. This objective should be shared across recruitment, HR, and marketing teams, along with a clear explanation of what success looks like and which metrics will be used to measure it. Using a shared workspace or dashboard helps ensure everyone is working from the same assumptions and data."
      },
      {
        question: "How can Twenty Twenty's automation help prevent these mistakes?",
        answer: "Twenty Twenty's automation focuses on creating structure and consistency across recruitment advertising. By standardizing campaign setup, centralizing performance insights, and automating key processes, teams gain clarity on objectives, cost per applicant, and follow-up speed. This reduces manual errors and helps teams stay aligned as campaigns scale."
      }
    ],
    content: (
      <>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Recruitment advertising has become a core pillar of modern hiring strategies. Social platforms and performance channels offer reach and speed that traditional methods cannot match.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Yet despite these tools, many recruitment campaigns still underperform. Not because the platforms don't work, but because of how campaigns are structured, measured, and followed up.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Below we outline five common mistakes we see in recruitment advertising today and why addressing them matters.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">1. No Clear Objective for the Advertising Campaign</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          One of the most common issues is the absence of a clearly defined campaign objective.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Advertising platforms require explicit choices: awareness, traffic, leads, or conversions. Each objective optimizes toward a different outcome. Problems arise when expectations do not match the chosen setup.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          For example, awareness campaigns are designed to maximize visibility, not to generate applications. Expecting high applicant volume from such a setup creates misalignment between goals and results.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Clear objectives create structure. They guide optimization, reporting, and decision-making throughout the campaign lifecycle.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">2. No Real Insight Into Cost per Applicant</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Many organizations struggle to answer a simple question: what does one applicant actually cost?
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Recruitment advertising data is often spread across ad platforms, landing pages, ATS systems, and internal reports. This fragmentation makes it difficult to calculate cost per applicant reliably.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Without clear insight into this metric, teams rely on assumptions instead of facts. That limits the ability to compare campaigns, scale success, or improve efficiency.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Transparency around cost per applicant is not a reporting detail. It is a strategic requirement.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">3. Vague or Non-Triggering Ad Copy</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Ad copy plays a decisive role in recruitment performance, yet it is often overly generic.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Many recruitment ads rely on broad descriptions and safe language. While this may feel inclusive, it rarely creates urgency or relevance.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Strong recruitment copy typically:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
          <li>Speaks to a specific role or situation</li>
          <li>Highlights why the opportunity matters</li>
          <li>Makes the next step clear</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-8">
          When candidates immediately understand what is expected and what to do next, conversion improves.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">4. Boring or Static Visuals</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Visual content still has a significant impact on recruitment advertising results.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Video content consistently outperforms static images because it provides context. It shows people, environments, and roles in a way static visuals cannot. This reduces uncertainty and builds trust before the click.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Static visuals can still play a role, but relying on them alone often limits performance, especially in crowded social feeds.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">5. Slow Follow-Up After Applying</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          A common breakdown occurs after the application is submitted.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Organizations invest heavily in driving applications, only to lose candidates due to slow follow-up. In competitive labor markets, delays of hours or days can significantly reduce response rates.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Candidates who apply via social platforms expect quick confirmation and clear next steps. Speed is not just operational efficiency, it directly impacts hiring outcomes.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Conclusion</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          These mistakes rarely occur in isolation. Unclear objectives affect reporting, limited insight slows learning, and slow follow-up undermines overall performance. Recruitment advertising works best when structure, clarity, and speed are aligned across the entire process.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          As recruitment advertising becomes more automated and data-driven, the margin for inefficiency shrinks. Teams that rely on clear objectives, transparent metrics, relevant messaging, and timely follow-up will be better positioned to attract and convert candidates consistently.
        </p>
      </>
    )
  },
  "openai-ad-minimum": {
    id: "openai-ad-minimum",
    title: "What OpenAI's $200,000 Ad Minimum Tells Us About the Future of Digital Advertising",
    excerpt: "OpenAI has confirmed a minimum commitment of $200,000 for advertisers entering its ChatGPT ad beta. The beta is live, tightly controlled, and intentionally small — and it tells us a great deal about where advertising is heading next.",
    author: "Our team",
    date: "February 18, 2026",
    readTime: "5 min read",
    category: "Industry Insights",
    faqs: [
      {
        question: "What is the minimum budget to advertise on ChatGPT?",
        answer: "OpenAI's current ad beta requires a minimum commitment of $200,000, with some brands being approached at $250,000 and select early partners reportedly committing up to $1 million. This is not a self-serve platform — access is by invitation only and intentionally restricted to established advertisers during the beta phase."
      },
      {
        question: "How much does it cost per impression?",
        answer: "Early pricing is reported at approximately $60 per 1,000 impressions (CPM). This is significantly higher than standard display or social media rates, reflecting the premium, intent-rich nature of the placement."
      },
      {
        question: "Will ads influence what ChatGPT recommends?",
        answer: "No. OpenAI has been explicit on this point. Ads are clearly labeled as sponsored and appear at the bottom of responses. They do not shape or influence the answers ChatGPT generates. The model's outputs remain independent of advertiser relationships."
      },
      {
        question: "Does ChatGPT share my conversation data with advertisers?",
        answer: "No. Advertiser reporting is limited to aggregate performance data — views and clicks. Advertisers do not receive access to individual conversations or personal user data. Users can also review why a specific ad was shown to them, turn off ad personalization, or opt out of ads entirely."
      },
      {
        question: "Will I see ads if I pay for ChatGPT?",
        answer: "No. Users on paid tiers — Plus, Pro, Business, and Enterprise — will not see ads. Advertising is limited to the free tier as a mechanism to support broader access to the product."
      },
      {
        question: "Is this relevant to recruitment advertising?",
        answer: "It is worth watching closely. Someone asking ChatGPT which recruitment platform to use, or how to write a job posting, is already mid-decision. Advertising in that context — matched to genuine intent — is a fundamentally different proposition from broad audience targeting. As the beta develops, recruitment and HR software brands are likely to be among the most relevant early adopters."
      }
    ],
    content: (
      <>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          When we wrote about OpenAI's initial advertising stance earlier this year, the story was still hypothetical. A direction, not a decision. That has changed.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          OpenAI has confirmed a minimum commitment of $200,000 for advertisers entering its ChatGPT ad beta — with some brands being approached at $250,000 and a few reportedly committing up to $1 million. The beta is live, tightly controlled, and intentionally small. And it tells us a great deal about where advertising is heading next.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">This Is Premium Inventory, By Design</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The $200,000 minimum is not arbitrary. It is a deliberate signal. By setting a high barrier to entry, OpenAI ensures that only established brands with serious budgets shape the early experience of advertising inside ChatGPT. Fly-by-night advertisers and low-quality placements are filtered out before they can damage user trust during a critical phase.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Early pricing is reported at around $60 per 1,000 impressions — significantly higher than standard display or social rates. OpenAI is positioning ChatGPT ads as premium inventory from day one, and the pricing reflects that.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">The Rules Have Not Changed — They Have Become Concrete</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          In January, OpenAI outlined its principles for advertising: answer independence, conversation privacy, user control. Those principles are now operational. Ads appear at the bottom of responses, clearly labeled as sponsored. They do not influence what ChatGPT recommends. Advertiser data is limited to aggregate performance — views and clicks — with no access to user conversations.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Users can dismiss ads, review why a specific ad appeared, turn off personalization, or opt out of ads entirely in exchange for reduced free usage. Paid subscribers on Plus, Pro, Business, and Enterprise tiers see no ads at all.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          There are also explicit content restrictions. Ads will not appear in conversations about health, mental health, or politics. They will not be served to users under 18. These guardrails reflect a considered approach to where commercial messaging does and does not belong.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Contextual Targeting at Scale</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The targeting model being tested does not rely on personal data or audience profiles. Instead, ads are matched to the general topic of a conversation. Ask about meal planning and you may see an ad for a grocery delivery service. Ask about productivity tools and you may see relevant software.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This is intent-based advertising in its most direct form. The user has already told the platform what they are thinking about. The ad does not interrupt — it follows. For marketing and recruitment teams, this is a meaningful shift. Reaching someone mid-task, in a moment of genuine intent, is fundamentally different from reaching them mid-scroll on a social feed.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">A Signal for the Broader Market</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          OpenAI is not alone in this direction. The advertising industry has been moving toward contextual, intent-driven models for years — accelerated by privacy changes, cookie deprecation, and declining trust in traditional targeting. What OpenAI is testing is a more advanced version of that shift: advertising that lives inside a reasoning interface rather than alongside passive content.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The questions that will define this space are not yet answered. How do users respond to commercial messages inside a tool they associate with objective answers? How do brands measure consistent exposure when AI responses vary? What happens to the model's perceived neutrality as ad revenue grows? These are open questions, and the current beta exists precisely to begin answering them.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">What This Means for Recruitment and Marketing Teams</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          For teams investing in digital advertising, the key takeaway is structural, not tactical. As AI interfaces become a primary entry point for research and decision-making, the moment of intent moves earlier in the journey. Someone asking ChatGPT which recruitment platform to use, or which HR software to consider, is already close to a decision.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Advertising in that context requires clarity, relevance, and trust — not volume or reach. The brands that perform well in AI-native advertising environments will be those that have invested in structured, transparent messaging. Not because of regulation, but because the context demands it.
        </p>
      </>
    )
  },
  "openai-advertising-future": {
    id: "openai-advertising-future",
    title: "What OpenAI's New Advertising Approach Signals for the Future of Digital Advertising",
    excerpt: "Recently, OpenAI published its official stance on introducing advertising within ChatGPT, not as a product launch, but as a deliberate experiment tied to a broader mission of making AI more accessible.",
    author: "Our team",
    date: "January 28, 2026",
    readTime: "5 min read",
    category: "Industry Insights",
    faqs: [
      {
        question: "Will advertisements influence ChatGPT's answers?",
        answer: "No. OpenAI has stated that advertisements are strictly separated from AI-generated responses. Ads do not affect how answers are generated, and the model's outputs are not shaped by advertisers."
      },
      {
        question: "How are ads selected inside conversational AI tools?",
        answer: "In OpenAI's approach, ads are selected based on contextual relevance rather than personal conversations or sensitive data. Placement is aligned with the general topic of a conversation, not with individual user profiles or private inputs."
      },
      {
        question: "Is user data shared with advertisers?",
        answer: "OpenAI has indicated that personal conversations are not sold to advertisers and that user data is protected. Users also have control over ad personalization settings, including the option to opt out."
      },
      {
        question: "What makes advertising in AI-driven environments different from traditional digital ads?",
        answer: "Advertising in AI-driven interfaces is more intent-based and context-aware. Instead of interrupting users with broad targeting, ads appear only when they are relevant to the subject being discussed, raising expectations around transparency and usefulness."
      },
      {
        question: "What does this mean for recruitment and marketing teams?",
        answer: "For recruitment, HR, and marketing teams, this shift emphasizes the importance of clarity, structure, and transparency in advertising. As AI handles more executional tasks, teams need systems that make decisions and performance easier to understand."
      },
      {
        question: "How will Twenty Twenty Solutions act on this trend?",
        answer: "Over the years, we have seen a clear shift from audience targeting toward contextual targeting, driven by new and emerging products and platforms that can be optimized for advertising. At the moment, we are actively investigating whether this type of advertising model — either through OpenAI's approach or through other contextual advertising solutions — can be added to our product library and future integrations. If you are interested in seeing a contextual advertising method added to the Twenty Twenty Solutions platform, feel free to let us know and we will get in touch."
      }
    ],
    content: (
      <>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Recently, OpenAI published its official stance on introducing advertising within ChatGPT, not as a product launch, but as a deliberate experiment tied to a broader mission of making AI more accessible.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          This is worth paying attention to, not just because ads may appear in a major AI platform, but because of what this signals about the evolving role of advertising in AI‑driven environments.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Ads to Support Access, Not Replace Values</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          OpenAI positions advertising as a way to support broader access to AI, particularly within free or lower‑cost tiers. Paid subscriptions remain ad‑free, reinforcing the idea that advertising is not the core product, but a supporting mechanism.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This framing matters. It places advertising in service of usability and accessibility, rather than engagement maximization.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">A Clear Separation Between Answers and Ads</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          One of the most notable aspects of OpenAI's approach is the strict separation between AI responses and advertising.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Ads are clearly labeled and do not influence the answers ChatGPT provides. Conversations are not sold to advertisers, and personal data is not shared. Users retain control over ad personalization.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This contrasts sharply with many traditional ad ecosystems, where optimization often prioritizes engagement metrics over clarity or user trust.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Contextual Relevance Over Broadcast Targeting</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Rather than relying on broad audience targeting, OpenAI's experiments focus on contextual relevance. Ads may appear after a response, and only when they meaningfully align with the subject of the conversation.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This represents a shift away from interruption‑based advertising toward relevance‑driven placement. The emphasis moves from reach to usefulness within a specific moment.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">A Signal, Not a Finished Model</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          OpenAI is still in an experimental phase. The exact shape of advertising within ChatGPT will evolve over time.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          But the direction is clear: advertising in AI‑native environments must be understandable, respectful, and contextually grounded.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          This is not about adding more ads. It is about redefining how advertising fits into modern digital experiences.
        </p>

        <h2 className="text-2xl font-now font-bold text-foreground mb-4">Why This Matters Now</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          For marketing, recruitment, and HR teams, this shift reinforces a broader reality.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          As AI takes on more executional work, value moves toward clarity, structure, and transparency. Systems that simplify decision‑making and make performance understandable will matter more than those that simply add reach.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Advertising is moving closer to intent, explanation, and control. Platforms and teams that adapt to that reality will be better positioned for what comes next.
        </p>
      </>
    )
  }
};

// Social sharing component
const SocialShare = ({ title, url }: { title: string; url: string }) => {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "The article link has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border shadow-lg z-50">
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Twitter className="h-4 w-4" />
            X (Twitter)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="flex items-center gap-2 cursor-pointer">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// FAQ Accordion component
const FAQSection = ({ faqs }: { faqs: FAQItem[] }) => {
  return (
    <div className="bg-muted/50 rounded-xl p-6 md:p-8 my-8">
      <h3 className="text-xl font-now font-bold text-foreground mb-6">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
            <AccordionTrigger className="text-left font-now font-semibold text-foreground hover:text-primary hover:no-underline py-4">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const post = slug ? blogPostsData[slug] : null;
  
  // Construct full URL for sharing
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${location.pathname}` 
    : '';

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-now font-bold">Post not found</h1>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/platform-overview" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Product
            </Link>
            <Link to="/become-partner" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Become a Partner
            </Link>
            <Link to="/blog" className="text-foreground font-now font-medium">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <MobileNav 
              links={[
                { to: "/platform-overview", label: "Product" },
                { to: "/become-partner", label: "Become a Partner" },
                { to: "/blog", label: "Blog" },
              ]}
              showDemoButton={false}
            />
          </div>
        </nav>
      </header>

      {/* Back Link */}
      <div className="container mx-auto px-4 pt-4">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors font-now"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Category badge */}
          <span className="inline-block px-3 py-1 text-xs font-now font-medium bg-primary/10 text-primary rounded-full mb-6">
            {post.category}
          </span>
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-now font-bold text-foreground leading-tight mb-6">
            {post.title}
          </h1>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground font-now mb-8 pb-8 border-b">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
            <SocialShare title={post.title} url={fullUrl} />
          </div>
          
          {/* Content */}
          <div className="prose prose-lg max-w-none font-now">
            {post.content}
          </div>
          
          {/* FAQ Section */}
          {post.faqs && post.faqs.length > 0 && (
            <FAQSection faqs={post.faqs} />
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
