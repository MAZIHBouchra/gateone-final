
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Heart, Share, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

import article1 from '@/assets/article-1.jpg';
import article2 from '@/assets/article-2.jpg';
import article3 from '@/assets/article-3.jpg';
import article5 from '@/assets/article-5.jpg';
import article6 from '@/assets/article-6.jpg';
import article7 from '@/assets/article-7.jpg';


const ArticleDetail = () => {
  const { id } = useParams();

  // Article data with proper typing
  const articlesData: Record<number, {
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    image: string;
    tags: string[];
    content: string;
  }> = {
      1: {
        title: "Marrakech Real Estate Market in 2025: A Dynamic Investment Destination",
        excerpt: "Explore the Marrakech Real Estate Market in 2025—key trends, property types, and investment opportunities in Morocco’s top real estate hub.",
        category: "Investment Trends",
        date: "2025-08-06",
        readTime: "6 min read",
        image: article1,
        tags: ["Marrakech Real Estate Market in 2025", "investment", "riads", "villas", "apartments"],
        content: `
    <p>It is expected that the Marrakech Real Estate Market in 2025 is anticipated to be among Morocco's appealing and lucrative sectors for investors. In a time of continuous economic growth, rapid urbanization, and evolving lifestyles for consumers, Marrakech continues to stand out as a top location for both local and international buyers. From luxurious villas located in exclusive neighborhoods to modern residences catering to professionals in the younger age group, the city's real estate options are varied and full of potential.</p>
    
    <p>What makes the Marrakech Real Estate Market in 2025 particularly appealing is the harmony it strikes between modernity and tradition. Investors have the option of restoring authentic riads inside the Medina or buying sleek green developments in recently constructed areas. In addition, Marrakech's status as a tourist destination increases the rental market, which can yield excellent returns on short-term holiday rentals. For investors looking for long-term investment, the increasing market demand of Moroccan expatriates (MREs) will ensure an ongoing flow of buyers throughout the year.</p>
    
    <p>International investors also show increasing interest in Morocco due to its better business climate, streamlined property laws, and digital processes that make buying, renting, or selling properties more transparent. This creates Marrakech as one of the most desirable African cities for real estate investments in 2025.</p>
    
    <h2 style="font-weight: bold;">Current Market Trends</h2>
    <p>The Marrakech Real Estate Market in 2025 is expected to be characterized by stability and sustained growth. One major factor is the city's flourishing tourism industry, attracting millions of tourists every year. This has created an ever-growing demand for short-term rentals, boutique hotels, and renovated riads. The Medina remains among the most sought-after regions, attracting investors seeking properties with architectural and cultural value.</p>
    
    <p>Modern neighborhoods such as Targa or Ourika Road are witnessing increasing demand, especially from middle-class Moroccan families seeking affordable, comfortable homes with access to essential amenities. These areas offer a blend of affordability and convenience, ideal for long-term residential investment.</p>
    
    <p>Post-pandemic, buyers are attracted to larger homes with private gardens, outdoor spaces, and pools. Builders have adapted, creating large, well-designed, and spacious homes in line with modern lifestyle requirements. Eco-conscious buyers are driving trends toward eco-friendly and energy-efficient homes, positioning Marrakech as an urban center embracing both tradition and modernity.</p>
    
    <p>For international investors, opportunities extend beyond residential properties to mixed-use developments combining retail, commercial, and residential areas. This diversification offers multiple income streams, reducing risk while increasing returns.</p>
    
    <h2 style="font-weight: bold;">Outlook for 2025</h2>
    <p>Looking ahead, the Marrakech Real Estate Market in 2025 is expected to continue growing due to Morocco’s expanding economy and ambitious construction projects, such as the Al Boraq high-speed train, which improves connectivity between cities and boosts investor confidence. Marrakech benefits from these improvements, providing better accessibility to expatriates, tourists, and business professionals.</p>
    
    <p>Experts expect price stability in 2025, offering steady growth rather than unsustainable increases. This makes Marrakech especially appealing for investors seeking secure long-term investments. Morocco's hosting of the FIFA World Cup is also expected to increase demand for residential and commercial real estate in Marrakech.</p>
    
    <p>The digital revolution further influences the market, allowing buyers to search for homes, compare rates, and complete transactions online. This greatly eases the process for foreign investors who may not be physically present in Morocco but are keen to invest.</p>
    
    <p>According to the World Bank's Morocco Economic Overview, steady economic growth ensures stability in the real estate market. Investors benefit from a secure environment, positioning Marrakech as an intelligent, stable, and future-oriented investment location.</p>
    
    <h2 style="font-weight: bold;">Investment Opportunities by Property Type</h2>
    <ul>
    <li><strong>Luxury Villas:</strong> Exclusive areas like Palmeraie and Hivernage remain highly sought-after. These villas attract tourists seeking luxury rental properties and provide high yields during peak season. Privacy, large gardens, and pools make them ideal for high-income investors.</li>
    <li><strong>Traditional Riads:</strong> Located in the Medina, riads are perfect for renovation or conversion into boutique hotels. Many investors transform them into luxury short-term rentals with high occupancy rates driven by cultural tourism.</li>
    <li><strong>Contemporary Apartments:</strong> Modern developments in Agdal and Targa target expatriates, professionals, and families seeking urban living with modern amenities, suitable for buyers and long-term tenants.</li>
    <li><strong>High-Growth Neighborhoods:</strong>
      <ul>
        <li>Agdal: Mixed-use projects blending commercial and residential properties.</li>
        <li>Targa: Rapidly expanding middle-income housing hub.</li>
        <li>Sidi Ghanem: Evolving into a creative and industrial zone with potential for residential-commercial blends.</li>
      </ul>
    </li>
    </ul>
    
    <p>Investors looking to diversify can explore retail spaces, co-working centers, or short-term lease platforms. Strategies can align with tourist trends and long-term urban growth.</p>
    
    <h2 style="font-weight: bold;">Conclusion</h2>
    <p>The Marrakech Real Estate Market in 2025 provides a blend of traditional values, rapid growth, and modern approaches. From luxury villas to affordable homes for middle-class families, it serves diverse investor profiles. Stability, economic growth, and infrastructure upgrades make Morocco one of North Africa’s most secure investment locations.</p>
    
    <p>For investors seeking rental income or long-term property appreciation, Marrakech guarantees constant demand from local and foreign buyers. Strategic investments in this market offer both financial rewards and the pleasure of owning property in one of the region’s most vibrant cultural cities.</p>
    
    <p><em>Interested in Marrakech real estate?</em> Contact Orchid Island now to learn more about options, receive expert advice, and align your investment plan with current market trends.</p>
        `,
      },
      2: {
        title: "Luxury Villas vs Apartments: Which Is the Better Investment?",
        excerpt: "Compare Luxury Villas and Apartments in Marrakech for investment—explore trends, rental potential, and long-term growth opportunities.",
        category: "Investment Insights",
        date: "2025-08-20",
        readTime: "7 min read",
        image: article2,
        tags: ["Luxury Villas vs Apartments", "Marrakech real estate", "investment", "apartments", "villas"],
        content: `
    <p>The Luxury Villas vs Apartments debate in Marrakech has grown into one of the top issues for real property investors. As Marrakech's housing market continues to grow, both local and foreign buyers are evaluating which type of property is most lucrative for yields. Should you buy an ultra-modern apartment in the city's center, or would a luxury villa in Palmeraie yield greater growth over the long term?</p>
    
    <p>Understanding the advantages and disadvantages of both choices is crucial for making informed investment decisions. Marrakech's real estate market in 2025 offers a variety of properties, including budget-friendly apartments and exclusive villas catering to high-end buyers.</p>
    
    <h2 style="font-weight: bold;">Marrakech Real Estate Market Overview</h2>
    <p>Marrakech is one of Morocco's most thriving real estate hubs, attracting investors worldwide. The Luxury Villas vs Apartments debate is influenced by property location and type. Apartments dominate central areas like Gueliz and Agdal due to affordability and accessibility, ideal for first-time buyers, young professionals, or investors seeking short-term rental income.</p>
    
    <p>Luxury villas, on the other hand, are often located in exclusive neighborhoods such as Palmeraie and Hivernage. With large plots, landscaped gardens, and private pools, villas appeal to wealthy buyers seeking privacy and prestige. Villas offer better long-term returns due to high-end rental prices and capital appreciation.</p>
    
    <p>Marrakech is particularly appealing because it blends tradition and modernity. Riads in the Medina attract restoration projects, while contemporary developments provide modern housing options. The best choice between villas and apartments depends on budget, investment goals, and personal preferences.</p>
    
    <h2 style="font-weight: bold;">Investment Potential of Apartments in Marrakech</h2>
    <p>Apartments are highly sought-after due to affordability and consistent rental demand. They often serve as a more accessible entry point for investors.</p>
    
    <ul>
    <li><strong>Lower Initial Investment:</strong> Apartments require less capital than villas, making them ideal for first-time investors.</li>
    <li><strong>High Rental Demand:</strong> Apartments in urban centers attract long-term tenants, professionals, and short-term renters seeking affordable accommodation.</li>
    <li><strong>Lower Maintenance:</strong> Shared amenities and smaller spaces make apartments easier and cheaper to maintain.</li>
    </ul>
    
    <p>Apartments offer flexibility, allowing investors to diversify portfolios across multiple units in different neighborhoods, spreading risk and maximizing rental yield. Marrakech's growing expatriate population ensures steady demand for well-located apartments.</p>
    
    <h2 style="font-weight: bold;">Investment Potential of Luxury Villas in Marrakech</h2>
    <p>Luxury villas appeal to investors seeking prestige and higher returns. Villas often outperform apartments in long-term appreciation and lifestyle benefits.</p>
    
    <ul>
    <li><strong>Capital Appreciation:</strong> Villas in high-demand areas such as Palmeraie appreciate faster than apartments.</li>
    <li><strong>Higher Rental Earnings:</strong> Private pools, large gardens, and luxurious amenities allow villas to command premium rental rates, especially during peak tourist seasons.</li>
    <li><strong>Living Value:</strong> Villas provide space, privacy, and luxury, making them attractive to both renters and buyers.</li>
    </ul>
    
    <p>The luxury market in Marrakech targets high-net-worth travelers and individuals seeking unique vacation experiences. As Morocco’s status as a top tourist destination grows, villas are expected to remain among the most lucrative investments in the city.</p>
    
    <h2 style="font-weight: bold;">Key Factors to Consider When Choosing Between Apartments and Villas</h2>
    <ul>
    <li><strong>Budget and Financing:</strong> Apartments are less expensive to purchase, while villas require more capital but yield higher returns.</li>
    <li><strong>Target Tenants:</strong> Apartments suit professionals, students, and expats, whereas villas attract visitors and high-end clients.</li>
    <li><strong>Location:</strong> Apartments excel in city centers; villas perform better in upscale, spacious neighborhoods.</li>
    <li><strong>Financial Goals:</strong> Apartments provide steady rental income, while villas are suited for long-term appreciation and luxury rentals.</li>
    </ul>
    
    <p>Each property type has advantages and disadvantages, and the best choice depends on your financial situation and risk tolerance.</p>
    
    <h2 style="font-weight: bold;">Conclusion: Apartments or Luxury Villas in Marrakech?</h2>
    <p>The choice between Luxury Villas and Apartments in Marrakech depends on investment strategy. Apartments are suitable for investors seeking low-cost, consistent rental demand, and low maintenance. Luxury villas are ideal for those aiming for capital growth, premium rental income, and lifestyle benefits.</p>
    
    <p>Both property types are essential in Marrakech’s real estate market, and many investors diversify their portfolios by purchasing a mix of apartments and villas. This approach balances short-term rental income with long-term appreciation.</p>
    
    <p><em>Interested in exploring your options?</em> Contact us today for expert advice and access to top luxury villas and modern apartments in Marrakech.</p>
        `,
      },
    
      3: {
        title: "Buying Property in Marrakech: Myths vs Reality",
        excerpt: "Discover the truth about buying property in Marrakech—debunk common myths and learn the facts about laws, pricing, and secure transactions.",
        category: "Investment Guidance",
        date: "2025-08-28",
        readTime: "6 min read",
        image: article3,
        tags: ["Buying Property in Marrakech", "real estate myths", "Marrakech investment", "property laws"],
        content: `
    <p>The process of purchasing property in Marrakech can be confusing for prospective investors due to many myths circulating about the local real estate market. Understanding Morocco's unique property laws, market trends, and legal processes is essential. This article distinguishes facts from fiction, helping buyers make informed decisions when purchasing property in Marrakech.</p>
    
    <h2 style="font-weight: bold;">Myth 1: Foreigners Cannot Buy Property in Marrakech</h2>
    <p>A common misconception is that foreigners face restrictions when buying property in Marrakech. In reality, foreigners can purchase properties under the same conditions as Moroccan citizens, adhering to national laws. Awareness of these regulations prevents unnecessary delays or miscommunications. Partnering with reliable lawyers and real estate professionals ensures a smooth and legal purchase process.</p>
    
    <h2 style="font-weight: bold;">Myth 2: Property Transactions Are Not Secure</h2>
    <p>Many buyers believe that property transactions in Marrakech are insecure or non-transparent. Moroccan law requires formal documentation, notarization, and registration for all property sales. Working with trusted legal advisors and reputable agencies guarantees secure and transparent transactions. For official guidance, buyers can consult the Moroccan Ministry of Justice Real Estate Guidelines.</p>
    
    <h2 style="font-weight: bold;">Myth 3: Property Prices in Marrakech Are Overpriced</h2>
    <p>Another myth suggests that Marrakech properties are more expensive compared to other Moroccan cities. While luxurious properties in prime locations are costly, the market also offers options for all budgets. Conducting thorough market analysis helps buyers find properties that meet their budget and investment goals, maximizing potential returns.</p>
    
    <h2 style="font-weight: bold;">Myth 4: The Buying Process Is Complicated and Slow</h2>
    <p>Some investors worry that buying property in Marrakech is overly complicated or time-consuming. Seeking expert advice from real estate and legal professionals can greatly simplify the process. From property search to contract completion, professional guidance reduces risk and improves efficiency.</p>
    
    <h2 style="font-weight: bold;">Myth 5: Property Ownership Rights Are Limited for Foreigners</h2>
    <p>It is sometimes believed that foreigners do not have full ownership rights in Morocco. In reality, Moroccan law protects property ownership for all. Buyers must ensure that their documents comply with local regulations to avoid legal issues, but they enjoy full property rights.</p>
    
    <h2 style="font-weight: bold;">Conclusion</h2>
    <p>Understanding the myths and facts about purchasing property in Marrakech is crucial for making smart and profitable investments. Educated buyers who work with experienced professionals can navigate the market effectively, minimize risks, and secure properties with strong long-term potential.</p>
    
    <p><em>Are you considering purchasing property in Marrakech?</em> Contact us today for professional guidance, market analysis, and reliable support to make the right investment decisions.</p>
        `,
      },
  };

  const articleId = parseInt(id || '1');
  const article = articlesData[articleId] || articlesData[1];
  
  const articleWithId = {
    ...article,
    id: articleId,
    featured: articleId === 1 || articleId === 3 || articleId === 6,
  };

  const relatedArticles = [
    {
      id: 2,
      title: "Understanding Mortgage Types and Requirements",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Financing"
    },
    {
      id: 3,
      title: "Home Inspection Checklist: What to Look For",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Buying Guide"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />
      
      <div className="pt-20">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
          <div className="absolute bottom-8 left-0 right-0">
            <div className="container-custom">
              <Badge className="bg-accent text-accent-foreground mb-4">{article.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-4 max-w-4xl">
                {article.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <section className="section-padding">
          <div className="container-custom max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(article.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center ml-auto gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Article Text */}
                <div 
                  className="prose prose-lg max-w-none text-foreground
                    prose-headings:font-playfair prose-headings:text-primary
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:leading-relaxed prose-p:mb-6
                    prose-strong:text-primary"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-lg font-playfair font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
                  <Link to="/journal">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Journal
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">

                {/* Newsletter */}
                <Card className="p-6 bg-primary text-primary-foreground">
                  <h3 className="text-lg font-playfair font-semibold mb-4">Stay Updated</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Subscribe to our newsletter for the latest real estate insights and market updates.
                  </p>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Subscribe Now
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
