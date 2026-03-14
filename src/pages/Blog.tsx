import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductDropdown } from "@/components/ProductDropdown";
import Logo from "@/components/ui/logo";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import openaiAdMinImage from "@/assets/openai-ad-blog.png";
import openaiAdBlogImage from "@/assets/openai-ad-blog.webp";
import recruitmentMistakesBlogImage from "@/assets/recruitment-mistakes-blog.avif";
import strategyAlignmentBlogImage from "@/assets/strategy-alignment-blog.png";
import realisticRecruitmentBlogImage from "@/assets/realistic-recruitment-blog.png";
import salaryTransparencyBlogImage from "@/assets/salary-transparency-blog.png";
import recruitmentAdvertisingBlogImage from "@/assets/recruitment-advertising-blog.png";

const blogPosts = [
  { id: "should-you-use-advertising-for-recruitment", slug: "should-you-use-advertising-for-recruitment", title: "Should You Use Advertising for Recruitment?", excerpt: "Recruitment has become a visibility challenge. If your hiring goals depend on consistent applicant flow, advertising is no longer optional — it is a strategic extension of talent acquisition.", author: "Our team", date: "February 23, 2026", readTime: "4 min read", category: "Strategy", image: recruitmentAdvertisingBlogImage },
  { id: "openai-ad-minimum", slug: "openai-ad-minimum", title: "What OpenAI's $200,000 Ad Minimum Tells Us About the Future of Digital Advertising", excerpt: "OpenAI has confirmed a minimum commitment of $200,000 for advertisers entering its ChatGPT ad beta.", author: "Our team", date: "February 18, 2026", readTime: "5 min read", category: "Industry Insights", image: openaiAdMinImage },
  { id: "salary-transparency-vacancy", slug: "salary-transparency-vacancy", title: "Why Not Listing a Salary in Your Vacancy Costs You Trust", excerpt: "Nearly 40% of candidates assume a company is a poor payer when no salary is mentioned.", author: "Our team", date: "February 10, 2026", readTime: "4 min read", category: "Best Practices", image: salaryTransparencyBlogImage },
  { id: "realistic-recruitment-advertising", slug: "realistic-recruitment-advertising", title: "Why Realistic Recruitment Advertising Is Becoming a Strategic Necessity", excerpt: "Many HR teams experience a disconnect between attraction and retention.", author: "Our team", date: "February 2, 2026", readTime: "4 min read", category: "Industry Insights", image: realisticRecruitmentBlogImage },
  { id: "aligning-hr-recruitment-marketing", slug: "aligning-hr-recruitment-marketing", title: "Aligning HR, Recruitment, and Marketing Through Advertising Automation", excerpt: "Recruitment advertising almost never lives with one team. Advertising automation becomes truly valuable when it connects these roles.", author: "Our team", date: "January 30, 2026", readTime: "4 min read", category: "Strategy", image: strategyAlignmentBlogImage },
  { id: "5-common-mistakes-recruitment-advertising", slug: "5-common-mistakes-recruitment-advertising", title: "5 Common Mistakes in Recruitment Advertising", excerpt: "Recruitment advertising has become a core pillar of modern hiring strategies. Yet despite powerful tools, many campaigns still underperform.", author: "Our team", date: "January 29, 2026", readTime: "4 min read", category: "Best Practices", image: recruitmentMistakesBlogImage },
  { id: "openai-advertising-future", slug: "openai-advertising-future", title: "What OpenAI's New Advertising Approach Signals for the Future of Digital Advertising", excerpt: "Recently, OpenAI published its official stance on introducing advertising within ChatGPT.", author: "Our team", date: "January 28, 2026", readTime: "5 min read", category: "Industry Insights", image: openaiAdBlogImage },
];

const Blog = () => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="hidden md:flex items-center gap-8">
            <ProductDropdown />
            <Link to="/become-partner" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">Become a partner</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">Pricing</Link>
            <Link to="/blog" className="text-foreground font-now font-medium">Blog</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <MobileNav showDemoButton={false} />
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 hero-padding">
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.75rem,5vw,3.5rem)]">
            Insights & Resources
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-now max-w-2xl mx-auto">
            Expert insights and industry perspectives to help teams navigate modern advertising with confidence.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 pb-10 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-7xl mx-auto">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
              <article className="unified-card !p-0 overflow-hidden h-full flex flex-col">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                  {post.image ? (
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xl font-now font-bold text-primary">20</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-now font-medium bg-primary/10 text-primary rounded-full w-fit">{post.category}</span>
                  <h2 className="text-lg font-now font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                  <p className="text-muted-foreground font-now text-sm line-clamp-3 flex-1">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-now pt-2">
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>{post.date}</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><span>{post.readTime}</span></div>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center text-sm font-now font-medium text-primary group-hover:gap-2 transition-all">
                      Read article <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="cta-banner">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-now font-bold text-foreground">Stay Updated</h2>
            <p className="text-muted-foreground font-now text-sm">Get the latest recruitment advertising insights delivered to your inbox.</p>
            <div className="pt-1">
              <Button size="lg" onClick={() => setIsNewsletterOpen(true)} className="text-primary-foreground w-full sm:w-auto">
                Subscribe to Newsletter <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isNewsletterOpen} onOpenChange={setIsNewsletterOpen}>
        <DialogContent className="w-[min(640px,calc(100vw-1.5rem))] h-[calc(100vh-1.5rem)] max-h-[900px] overflow-hidden p-0">
          <iframe src="https://c1eb69ba.sibforms.com/serve/MUIFACFgaD0ywFJbLkU3c01zsTjuJbu_hK4vizKUGhJbiRIrUXXWqPt6qy6btsVR2F_FLAVGQNuZadDb8CwPyPmjtBZdhhHf9yCnuPl0BYi2oGh-LJ-BIPUfH9z2XTDuOk2iVzdof5OBoXTRwCLQtWSz2QDvgud22GRNGz5TBS2dvJ0BKdfj_DRX5qiPKGSY6CXPuxwFO06SM52Bdg==" frameBorder="0" scrolling="no" allowFullScreen className="block h-full w-full border-0" title="Newsletter Subscription" />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Blog;