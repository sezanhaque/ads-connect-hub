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
  "openai-advertising-future": {
    id: "openai-advertising-future",
    title: "What OpenAI's New Advertising Approach Signals for the Future of Digital Advertising",
    excerpt: "Recently, OpenAI published its official stance on introducing advertising within ChatGPT, not as a product launch, but as a deliberate experiment tied to a broader mission of making AI more accessible.",
    author: "20/20 Solutions Team",
    date: "January 28, 2025",
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
