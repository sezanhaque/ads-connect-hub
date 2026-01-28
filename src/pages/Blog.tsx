import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import openaiAdBlogImage from "@/assets/openai-ad-blog.webp";
import recruitmentMistakesBlogImage from "@/assets/recruitment-mistakes-blog.avif";

// Blog posts data
const blogPosts = [
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
    date: "January 28, 2025",
    readTime: "5 min read",
    category: "Industry Insights",
    image: openaiAdBlogImage,
  }
];

const Blog = () => {
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

      {/* Newsletter CTA */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-now font-bold text-foreground">
            Stay Updated
          </h2>
          <p className="text-muted-foreground font-now">
            Get the latest recruitment advertising insights delivered to your inbox.
          </p>
          <div className="pt-2">
            <Button size="lg" variant="accent" className="text-foreground">
              Subscribe to Newsletter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
