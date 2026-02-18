import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import openaiAdMinImage from "@/assets/openai-ad-blog.png";
import salaryTransparencyBlogImage from "@/assets/salary-transparency-blog.png";
import realisticRecruitmentBlogImage from "@/assets/realistic-recruitment-blog.png";

const recentArticles = [
  {
    slug: "openai-ad-minimum",
    title: "What OpenAI's $200,000 Ad Minimum Tells Us About the Future of Digital Advertising",
    excerpt: "OpenAI has confirmed a minimum commitment of $200,000 for advertisers entering its ChatGPT ad beta. Tightly controlled and intentionally small — it tells us where advertising is heading next.",
    category: "Industry Insights",
    date: "February 18, 2026",
    readTime: "5 min read",
    image: openaiAdMinImage,
  },
  {
    slug: "salary-transparency-vacancy",
    title: "Why Not Listing a Salary in Your Vacancy Costs You Trust",
    excerpt: "Nearly 40% of candidates assume a company is a poor payer when no salary is mentioned.",
    category: "Best Practices",
    date: "February 10, 2026",
    readTime: "4 min read",
    image: salaryTransparencyBlogImage,
  },
  {
    slug: "realistic-recruitment-advertising",
    title: "Why Realistic Recruitment Advertising Is Becoming a Strategic Necessity",
    excerpt: "Many HR teams experience a disconnect between attraction and retention.",
    category: "Industry Insights",
    date: "February 2, 2026",
    readTime: "4 min read",
    image: realisticRecruitmentBlogImage,
  },
];

const NewsInsights = () => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-now font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          News & insights
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-10">
          {recentArticles.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/blog/${article.slug}`}
                className="group block h-full"
              >
                <article className="bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    {/* Category badge */}
                    <span className="inline-block px-2.5 py-0.5 text-xs font-now font-medium bg-primary/10 text-primary rounded-full w-fit">
                      {article.category}
                    </span>
                    
                    {/* Title */}
                    <h3 className="text-lg font-now font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-muted-foreground font-now text-sm line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>
                    
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-now pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mb-16">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary font-now font-medium hover:underline"
          >
            View all news
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Newsletter signup - matching Blog page style */}
        <motion.div 
          className="max-w-3xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl md:text-3xl font-now font-bold text-foreground">
            Stay Updated
          </h3>
          <p className="text-muted-foreground font-now">
            Get the latest recruitment advertising insights delivered to your inbox.
          </p>
          <div className="pt-2">
            <Button size="lg" variant="accent" className="text-foreground" onClick={() => setIsNewsletterOpen(true)}>
              Subscribe to Newsletter
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Newsletter Dialog */}
        <Dialog open={isNewsletterOpen} onOpenChange={setIsNewsletterOpen}>
          <DialogContent className="w-[min(640px,calc(100vw-1.5rem))] h-[calc(100vh-1.5rem)] max-h-[900px] overflow-hidden p-0">
            <iframe
              src="https://c1eb69ba.sibforms.com/serve/MUIFACFgaD0ywFJbLkU3c01zsTjuJbu_hK4vizKUGhJbiRIrUXXWqPt6qy6btsVR2F_FLAVGQNuZadDb8CwPyPmjtBZdhhHf9yCnuPl0BYi2oGh-LJ-BIPUfH9z2XTDuOk2iVzdof5OBoXTRwCLQtWSz2QDvgud22GRNGz5TBS2dvJ0BKdfj_DRX5qiPKGSY6CXPuxwFO06SM52Bdg=="
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              className="block h-full w-full border-0"
              title="Newsletter Subscription"
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default NewsInsights;
