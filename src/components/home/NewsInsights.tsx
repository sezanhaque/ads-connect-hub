import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import openaiAdMinImage from "@/assets/openai-ad-blog.png";
import salaryTransparencyBlogImage from "@/assets/salary-transparency-blog.png";
import recruitmentAdvertisingBlogImage from "@/assets/recruitment-advertising-blog.png";

const recentArticles = [
  {
    slug: "should-you-use-advertising-for-recruitment",
    title: "Should You Use Advertising for Recruitment?",
    excerpt: "Recruitment has become a visibility challenge. If your hiring goals depend on consistent applicant flow, advertising is no longer optional.",
    category: "Strategy",
    date: "February 23, 2026",
    readTime: "4 min read",
    image: recruitmentAdvertisingBlogImage,
  },
  {
    slug: "openai-ad-minimum",
    title: "What OpenAI's $200,000 Ad Minimum Tells Us About the Future of Digital Advertising",
    excerpt: "OpenAI has confirmed a minimum commitment of $200,000 for advertisers entering its ChatGPT ad beta.",
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
];

const NewsInsights = () => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          News & insights
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto mb-8">
          {recentArticles.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/blog/${article.slug}`} className="group block h-full">
                <article className="unified-card !p-0 overflow-hidden h-full flex flex-col">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 md:p-5 space-y-2.5 flex-1 flex flex-col">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-now font-medium bg-primary/10 text-primary rounded-full w-fit">
                      {article.category}
                    </span>
                    <h3 className="text-base font-now font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground font-now text-sm line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-now pt-1">
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

        <div className="text-center mb-12">
          <Link to="/blog" className="inline-flex items-center text-primary font-now font-medium hover:underline text-sm">
            View all news <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Newsletter signup */}
        <motion.div
          className="cta-banner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl md:text-2xl font-now font-bold text-foreground">Stay Updated</h3>
          <p className="text-muted-foreground font-now text-sm">
            Get the latest recruitment advertising insights delivered to your inbox.
          </p>
          <div className="pt-1">
            <Button size="lg" onClick={() => setIsNewsletterOpen(true)} className="text-primary-foreground w-full sm:w-auto">
              Subscribe to Newsletter <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

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