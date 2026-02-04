import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import openaiAdBlogImage from "@/assets/openai-ad-blog.webp";
import recruitmentMistakesBlogImage from "@/assets/recruitment-mistakes-blog.avif";
import strategyAlignmentBlogImage from "@/assets/strategy-alignment-blog.png";
import realisticRecruitmentBlogImage from "@/assets/realistic-recruitment-blog.png";

// Blog posts data
const blogPosts = [
  {
    id: "realistic-recruitment-advertising",
    slug: "realistic-recruitment-advertising",
    title: "Why Realistic Recruitment Advertising Is Becoming a Strategic Necessity",
    excerpt: "Many HR teams experience a disconnect between attraction and retention. Application volumes may be high, but early drop-off and short tenure remain persistent challenges.",
    author: "Our team",
    date: "February 2, 2026",
    readTime: "4 min read",
    category: "Industry Insights",
    image: realisticRecruitmentBlogImage,
  },
  {
    id: "aligning-hr-recruitment-marketing",
    slug: "aligning-hr-recruitment-marketing",
    title: "Aligning HR, Recruitment, and Marketing Through Advertising Automation",
    excerpt: "Recruitment advertising almost never lives with one team. Advertising automation becomes truly valuable when it is used to connect these roles instead of separating them further.",
    author: "Our team",
    date: "January 30, 2026",
    readTime: "4 min read",
    category: "Strategy",
    image: strategyAlignmentBlogImage,
  },
  {
    id: "5-common-mistakes-recruitment-advertising",
    slug: "5-common-mistakes-recruitment-advertising",
    title: "5 Common Mistakes in Recruitment Advertising",
    excerpt: "Recruitment advertising has become a core pillar of modern hiring strategies. Yet despite powerful tools, many campaigns still underperform. Here are five common mistakes and why addressing them matters.",
    author: "Our team",
    date: "January 29, 2026",
    readTime: "4 min read",
    category: "Best Practices",
    image: recruitmentMistakesBlogImage,
  },
  {
    id: "openai-advertising-future",
    slug: "openai-advertising-future",
    title: "What OpenAI's New Advertising Approach Signals for the Future of Digital Advertising",
    excerpt: "Recently, OpenAI published its official stance on introducing advertising within ChatGPT, not as a product launch, but as a deliberate experiment tied to a broader mission of making AI more accessible.",
    author: "Our team",
    date: "January 28, 2026",
    readTime: "5 min read",
    category: "Industry Insights",
    image: openaiAdBlogImage,
  }
];

const Blog = () => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  useEffect(() => {
    // Load Brevo form script when dialog opens
    if (isNewsletterOpen) {
      const script = document.createElement("script");
      script.src = "https://sibforms.com/forms/end-form/build/main.js";
      script.defer = true;
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isNewsletterOpen]);

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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(2rem,6vw,3.5rem)]">
            Insights & Resources
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-now subtitle max-w-2xl mx-auto">
            Expert insights and industry perspectives to help teams navigate modern advertising with confidence.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {blogPosts.map((post) => (
            <Link 
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group"
            >
              <article className="bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-now font-bold text-primary">20</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Category badge */}
                  <span className="inline-block px-3 py-1 text-xs font-now font-medium bg-primary/10 text-primary rounded-full">
                    {post.category}
                  </span>
                  
                  {/* Title */}
                  <h2 className="text-xl font-now font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  {/* Excerpt */}
                  <p className="text-muted-foreground font-now text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-now pt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  {/* Read more link */}
                  <div className="pt-2">
                    <span className="inline-flex items-center text-sm font-now font-medium text-primary group-hover:gap-2 transition-all">
                      Read article
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-now font-bold text-foreground">
            Stay Updated
          </h2>
          <p className="text-muted-foreground font-now">
            Get the latest recruitment advertising insights delivered to your inbox.
          </p>
          <div className="pt-2">
            <Button size="lg" variant="accent" className="text-foreground" onClick={() => setIsNewsletterOpen(true)}>
              Subscribe to Newsletter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Dialog */}
      <Dialog open={isNewsletterOpen} onOpenChange={setIsNewsletterOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-now font-bold">Subscribe to Newsletter</DialogTitle>
          </DialogHeader>
          <div className="sib-form-container">
            <div id="sib-form-container" className="sib-form-container">
              <div id="error-message" className="sib-form-message-panel hidden p-4 mb-4 bg-destructive/10 text-destructive rounded-lg">
                <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                  <span className="sib-form-message-panel__inner-text">
                    Your subscription could not be saved. Please try again.
                  </span>
                </div>
              </div>
              <div id="success-message" className="sib-form-message-panel hidden p-4 mb-4 bg-success/10 text-success rounded-lg">
                <div className="sib-form-message-panel__text sib-form-message-panel__text--center">
                  <span className="sib-form-message-panel__inner-text">
                    Your subscription has been successful.
                  </span>
                </div>
              </div>
              <div id="sib-container" className="sib-container--large sib-container--vertical space-y-4">
                <form
                  id="sib-form"
                  method="POST"
                  action="https://a0a3cdf4.sibforms.com/serve/MUIFAFZSv_V_-Dv5_V_QZFZRxFRjzMPNSJjx_TdKsOQ5ukxFGVE8_xCCwNfNRy0u-0rg8OsHaRqLdYj7IYONbqfwZcP6OTtV4EW6yNfJxYmQpXXX5YVLDhRBQyCQZyJvZT_i7hL8Dc9sMZfMZbRkwh-sGVHdNnMw7L0bSh8vKRxNqKiWfxNdDKMnQxdh"
                  data-type="subscription"
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-now font-semibold text-foreground">What others are following</h3>
                    <p className="text-sm text-muted-foreground font-now">
                      Sharing perspectives on how technology, automation and AI are reshaping processes across sectors.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="EMAIL">
                      E-mail <span className="text-destructive">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                      type="email"
                      id="EMAIL"
                      name="EMAIL"
                      autoComplete="off"
                      placeholder="email@company.com"
                      data-required="true"
                      required
                    />
                  </div>
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-input"
                      value="1"
                      id="OPT_IN"
                      name="OPT_IN"
                      required
                    />
                    <label className="text-sm text-muted-foreground font-now" htmlFor="OPT_IN">
                      I agree to receive your newsletters and accept the data privacy statement.
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You may unsubscribe at any time using the link in our newsletter.
                  </p>
                  <Button type="submit" className="w-full" size="lg">
                    Explore our insights
                  </Button>
                  <input type="text" name="email_address_check" value="" className="hidden" />
                  <input type="hidden" name="locale" value="en" />
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Blog;
