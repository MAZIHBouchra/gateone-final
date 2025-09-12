
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
      title: "Marrakech Estate Real Estate Market in 2025 – Key Trends for Investors",
      excerpt: "The Marrakech real estate market in 2025 shows stable growth, driven by economic expansion, tourism, and shifting buyer preferences toward spacious, eco-friendly homes. With opportunities ranging from luxury villas and traditional riads to modern apartments in emerging neighborhoods, the market offers diverse investment potential supported by infrastructure improvements and increasing digitization.",
      category: "Investment Trends",
      date: "2025-08-06",
      readTime: "5 min read",
      image: article1,
      tags: ["Marrakech real estate 2025", "tips", "mortgage", "home-buying"],
      content: `
  <p>The Marrakech real estate market in 2025 is expected to remain one of Morocco’s most attractive investment sectors. With steady economic growth, urbanization, and evolving consumer preferences, the market offers diverse opportunities—from luxurious villas to modern housing developments.</p>

  <h2 style="font-weight: bold;">Current Market Trends</h2>
  <p>The market continues to show stable, controlled growth, supported by tourism and increasing demand from Moroccan residents abroad (MREs). Historic areas like the Medina appeal to those seeking boutique hotels and riads, while neighborhoods like Targa and Ourika Road offer new homes for middle-class buyers.</p>

  <p>Post-pandemic shifts have increased interest in larger homes with outdoor spaces and pools. Developers are responding with spacious, feature-rich layouts, while eco-friendly, energy-efficient construction is rising, especially in the high-end segment.</p>

  <h2 style="font-weight: bold;">2025 Market Outlook</h2>
  <p>With Morocco's economy expanding and major infrastructure projects like the Al Boraq high-speed train underway, investor confidence is growing. Experts predict price stabilization, while Morocco’s role in the upcoming FIFA World Cup is likely to boost market activity further.</p>

  <p>Digitization is simplifying real estate transactions, offering easier access for both foreign and local investors through online platforms and tools.</p>

  <h2 style="font-weight: bold;">Investment Opportunities by Property Type</h2>
  <h3>Luxury Villas</h3>
  <p>Prime areas like Palmeraie and Hivernage offer strong rental potential, particularly during tourist seasons, combining privacy with accessibility.</p>

  <h3 style="font-weight: bold;">Traditional Riads</h3>
  <p>Located in the Medina, these properties are ideal for restoration or use in hospitality, providing high returns through luxury short-term rentals.</p>

  <h3 style="font-weight: bold;">Modern Apartments</h3>
  <p>Developers in areas like Agdal and Targa are meeting demand for urban, well-equipped homes—appealing to professionals and expats.</p>

  <h2 style="font-weight: bold;">High-Growth Neighborhoods</h2>
  <ul>
    <li><strong>Agdal:</strong> Active development zone with strong mixed-use investment potential.</li>
    <li><strong>Targa:</strong> Rapidly growing residential hub for middle-income families.</li>
    <li><strong>Sidi Ghanem:</strong> Emerging industrial and creative district with residential-commercial potential.</li>
  </ul>

  <h2 style="font-weight: bold;">Conclusion</h2>
  <p>The Marrakech real estate market in 2025 offers a compelling blend of growth, diversity, and sustainability. Whether you're interested in luxury properties, traditional riads, or modern urban housing, there are opportunities to suit various strategies. The future is bright for investors ready to enter or expand in this dynamic market.</p>

  <p><em>Interested in Marrakech real estate?</em> Contact us to explore current listings, get tailored advice, and align your strategy with market trends.</p>
`,

    },
    2: {
      title: "Effective Strategies to Market Your Marrakech Property to International Buyers and Renters",
      excerpt: "Discover the latest market insights and predictions that will shape the real estate landscape in the coming months.",
      category: "Market Analysis",
      date: "2025-07-31",
      readTime: "6 min read",
      image: article2,
      tags: ["market-trends", "analysis", "investment", "2025"],
      content: `
        <p>Marrakech continues to attract international interest for both property purchases and rental investments. With the rise of global mobility and digital platforms, the opportunity to market your Marrakech property to international buyers has never been greater. This guide outlines key strategies to enhance your property’s visibility and appeal across international markets.</p>

<h2 style="font-weight: bold;">1. Optimize Listings for Global Platforms</h2>
<p>To market your Marrakech property, it’s essential to use property websites with international reach. Platforms like <strong>Rightmove Overseas</strong>, <strong>Kyero</strong>, <strong>Green-Acres</strong>, and <strong>Properstar</strong> offer listings in multiple languages and target foreign audiences actively looking to invest abroad.</p>
<ul>
  <li>Include professional photos</li>
  <li>Provide an accurate description in at least English and French</li>
  <li>Use measurements in both square meters and square feet</li>
  <li>Include a clear price in multiple currencies (e.g., MAD, EUR, USD)</li>
</ul>

<h2 style="font-weight: bold;">2. Leverage Local Real Estate Agencies with International Reach</h2>
<p>Working with a local agency experienced in targeting international clients—such as <strong>GateOne</strong>—can streamline the process. They understand local regulations and have direct access to international buyers through multilingual teams and global partnerships.</p>
<p>This is one of the most efficient ways to market your Marrakech property to international buyers while ensuring legal and transactional security.</p>

<h2 style="font-weight: bold;">3. Create a Dedicated Property Website or Landing Page</h2>
<p>Having a dedicated online presence allows you to present your property in more detail:</p>
<ul>
  <li>Domain name in English</li>
  <li>Full photo and video gallery</li>
  <li>Interactive map location</li>
  <li>Local lifestyle and neighborhood information</li>
</ul>
<p>A website helps build trust and allows you to control how you market your Marrakech property to international buyers.</p>

<h2 style="font-weight: bold;">4. Use Paid Digital Advertising Targeted by Country</h2>
<p>Use platforms like <strong>Facebook Ads</strong> and <strong>Google Ads</strong> to target potential buyers in specific countries such as France, the UK, the Gulf countries, or North America.</p>
<ul>
  <li>Target by location, language, and interests (e.g., property investment, Morocco travel)</li>
  <li>Promote specific benefits (e.g., ROI, legal ownership for foreigners, tourist demand)</li>
</ul>
<p>This can significantly increase visibility among a qualified audience.</p>

<h2 style="font-weight: bold;">5. Prepare Legal and Financial Documents in Advance</h2>
<p>International buyers expect clarity and transparency. To market your Marrakech property to international buyers, prepare the following in advance:</p>
<ul>
  <li>Property title and registration</li>
  <li>Floor plans and permits</li>
  <li>Tax and utility records</li>
  <li>Rental income history (if applicable)</li>
</ul>
<p>Having this documentation ready improves buyer confidence and accelerates the sale process.</p>

<h2 style="font-weight: bold;">6. Offer Virtual Tours and Remote Buying Options</h2>
<p>Many international buyers make initial decisions remotely. Offering:</p>
<ul>
  <li>3D virtual tours</li>
  <li>Live video calls</li>
  <li>Online reservation and deposit processes</li>
</ul>
<p>…makes it easier to market your Marrakech property to international buyers who may not be able to visit in person.</p>

<h2 style="font-weight: bold;">Conclusion</h2>
<p>To effectively market your Marrakech property to international buyers and renters, you need a clear digital strategy, reliable local support, and professional presentation. Combining online tools with real estate expertise ensures that your property reaches the right audience globally.</p>
      `,
    },
    3: {
      title: "Apartments vs Luxury Villas Marrakech: Which Is the Best Real Estate Investment?",
      excerpt: "This guide compares the investment potential of apartments versus luxury villas in Marrakech, helping investors choose based on budget, rental income, and long-term growth.",
      category: "Investment Tips",
      date: "2025-07-31",
      readTime: "6 min read",
      image: article3,
      tags: ["Apartment", "interior-design", "Villa", "home-value"],
      content: `
        <section>
  <h2 style="font-weight: bold;"><strong>Luxury Villas vs Apartments in Marrakech: Which Is the Better Investment?</strong></h2>
  <p>
    The Marrakech real property market continues to draw both foreign and local investors. A frequently asked question is: <strong>Luxury villas vs apartments Marrakech</strong> — which type of property offers the greatest investment potential? Understanding the benefits of both apartments and <strong>luxurious villas in Marrakech</strong> can help investors make informed decisions.
  </p>

  <h3 style="font-weight: bold;"><strong>Marrakech Real Estate Market Overview</strong></h3>
  <p>
    Marrakech offers diverse real estate options. <strong>Apartments</strong> are typically located in central and accessible areas and are more affordable for first-time or moderate investors. In contrast, <strong>luxurious villas in Marrakech</strong> are often situated in upscale areas like Palmeraie, offering more space and exclusive amenities.
  </p>

  <h3 style="font-weight: bold;"><strong>Investment Potential of Apartments in Marrakech</strong></h3>
  <ul>
    <li><strong>Lower initial investment:</strong> Apartments require less capital, making them accessible to a broader range of investors.</li>
    <li><strong>High rental demand:</strong> Due to their affordability and location, apartments are attractive for both long-term and short-term rentals.</li>
    <li><strong>Lower maintenance:</strong> Apartments are generally easier and less costly to maintain than villas.</li>
  </ul>

  <h3 style="font-weight: bold;"><strong>Investment Potential of Luxury Villas in Marrakech</strong></h3>
  <ul>
    <li><strong>Capital appreciation:</strong> Luxury villas, especially in prime locations, tend to appreciate faster in value.</li>
    <li><strong>Higher rental income:</strong> Villas appeal to upscale travelers and can command higher rents, especially during tourist seasons.</li>
    <li><strong>Lifestyle advantages:</strong> Many luxury villas come with private pools, landscaped gardens, and spacious interiors ideal for high-end buyers.</li>
  </ul>

  <h3 style="font-weight: bold;"><strong>Key Factors to Consider When Choosing Between Apartments and Villas</strong></h3>
  <ul>
    <li>Available budget and financing options</li>
    <li>Target tenant demographics and expected rental yield</li>
    <li>Location and market trends within Marrakech</li>
    <li>Long-term appreciation vs immediate rental income goals</li>
  </ul>

  <h3 style="font-weight: bold;"><strong>Conclusion: Apartments or Luxury Villas in Marrakech?</strong></h3>
  <p>
    The decision between <strong>apartments and luxury villas in Marrakech</strong> depends on your investment goals. Apartments offer more affordable and steady rental returns, while <strong>luxurious villas in Marrakech</strong> provide greater long-term growth and rental potential.
  </p>

  <p><strong>Ready to invest in Marrakech real estate?</strong><br />
    Contact <strong>GateOne</strong> for expert advice and access to a wide range of luxury villas and apartments tailored to your investment needs.
  </p>
</section> `,
    },
    4: {
      title: "Who Owns Marrakech?",
      excerpt: "Explores how Marrakech's real estate landscape has shifted due to rising foreign investment, transforming ownership, prices, and the city's socio-economic fabric",
      category: "Investment",
      date: "2025-07-25",
      readTime: "5 min read",
      image: article5,
      tags: ["investment", "Marrakech", "Transformation", "Economy"],
      content: `
        <section className="space-y-6">
  <h2 style="font-weight: bold;">Marrakech has always fascinated</h2>
  <p>
    Between its centuries-old ramparts, lush gardens and hidden riads, the city attracts passing tourists as much as investors from all over the world. But behind the mudbrick walls and lively alleyways, one question remains: who really owns Marrakech?
  </p>

  <h2 style="font-weight: bold;">Marrakech, a Moroccan city… and an international one</h2>
  <p>
    Since the 2000s, Marrakech has become one of the top destinations for foreign buyers. French, Spanish, British, Italians — and increasingly Gulf investors and major hotel groups — have invested massively here.
  </p>
  
  <h2 style="font-weight: bold;">Key figures:</h2>
  <ul style="font-weight: bold;">
    <li>A large share of the medina’s riads now belong to Europeans, often converted into guesthouses.</li>
    <li>Areas such as the Palmeraie, Targa, or the Ourika road are flourishing with luxury residences and villas acquired by wealthy, often non-resident buyers.</li>
  </ul>

  <h2 style="font-weight: bold;">Moroccans remain the majority… but at what cost?</h2>
  <p>
    While ownership remains mostly Moroccan, the rise of the luxury real estate market has deeply transformed the local market.
  </p>
  <ul className="list-disc list-inside">
    <li>In certain districts, the price per square meter rivals that of some European cities.</li>
    <li>Many Marrakchi families prefer to sell their riad or family land to benefit from rising prices and move to the outskirts.</li>
  </ul>

  <h2 style="font-weight: bold;">Developers, investment funds, and major groups</h2>
  <p>
    Behind the large tourist complexes or mixed-use (residential + hotel) projects stand powerful players:
  </p>
  <ul className="list-disc list-inside">
    <li>Moroccan groups (Addoha, Alliances, Palmeraie Développement…)</li>
    <li>Foreign investment funds</li>
    <li>International hotel chains (Four Seasons, Mandarin Oriental, Fairmont, Hyatt…)</li>
  </ul>
  <p>
    These players buy entire hectares to build resorts, golf courses, hotels and gated residences.
  </p>

  <h2 style="font-weight: bold;">Who owns Marrakech?</h2>
  <p>
    It’s both an economic, social and heritage question. Today, Marrakech belongs to its residents, its investors, its visitors… and to the history it continues to write.
  </p>
</section>
      `,
    },
    5: {
      title: "Investing in Real Estate Near Morocco Mall Marrakech",
      excerpt: "Investing in real estate near Morocco Mall Marrakech offers strategic location benefits, rising residential and commercial demand, and strong long-term value potential.",
      category: "Lifestyle",
      date: "2025-07-25",
      readTime: "5 min read",
      image: article6,
      tags: ["High-demand", "Marrakech", "Benefits", "Investment"],
      content: `
        <p>Sustainable living is becoming increasingly important as homeowners seek to reduce their environmental footprint while enjoying long-term cost savings through energy efficiency.</p>
        <h2 style="font-weight: bold;">Solar Energy Systems</h2>
        <p>Solar panels have become more affordable and efficient, offering significant long-term savings on electricity bills while reducing reliance on fossil fuels.</p>
        <h2 style="font-weight: bold;">Smart Home Technology</h2>
        <p>Smart thermostats, LED lighting, and energy monitoring systems help optimize energy usage and provide real-time feedback on consumption patterns.</p>
        <h2 style="font-weight: bold;">Water Conservation</h2>
        <p>Low-flow fixtures, rainwater harvesting systems, and drought-resistant landscaping can significantly reduce water usage and utility costs.</p>
        <h2 style="font-weight: bold;">Sustainable Materials</h2>
        <p>Choose building materials with low environmental impact, such as bamboo flooring, recycled content insulation, and low-VOC paints and finishes.</p>
      `,
    },
    6: {
      title: "Common Myths About Buying Property in Marrakech Debunked",
      excerpt: "This article debunks common myths about buying property in Marrakech, emphasizing that foreigners have equal rights and that the process can be secure and straightforward with expert guidance.",
      category: "Luxury Investment",
      date: "2025-07-23",
      readTime: "6 min read",
      image: article7,
      tags: ["luxury", "premium-market", "high-end", "Investment"],
      content: `
        <section>
  <h2 style="font-weight: bold;"><strong>Buying Property in Marrakech: Myths vs Reality</strong></h2>
  <p>Buying property in Marrakech myths often confuse potential buyers. The purchase of a property in Marrakech requires navigating a distinct real property market. This article clarifies the most commonly held misconceptions regarding purchasing property in Marrakech and offers factual information to help buyers make educated choices.</p>

  <h3 style="font-weight: bold;"><strong>Myth 1: Foreigners Cannot Buy Property in Marrakech</strong></h3>
  <p>The most common misconception is that foreigners are subject to limitations when purchasing properties in Marrakech. In reality, foreigners are able to purchase property with the same rights as locals if they adhere to the laws. Knowing these rules is essential to avoid delays that are unnecessary.</p>

  <h3 style="font-weight: bold;"><strong>Myth 2: Property Transactions Are Not Secure</strong></h3>
  <p>Many buyers feel that transactions with property in Marrakech are not secure and transparent. Yet, Moroccan law requires official documentation, notarization and registration in order to ensure security. Employing legal advisers who are trusted and reliable agencies also protects buyers.</p>

  <h3 style="font-weight: bold;"><strong>Myth 3: Property Prices in Marrakech Are Overpriced</strong></h3>
  <p>There is a belief that Marrakech properties are expensive in comparison with other areas. Although luxury categories can be sold at premium prices, the market has many options for different budgets. Market research and analysis can help buyers to find affordable prices.</p>

  <h3 style="font-weight: bold;"><strong>Myth 4: The Buying Process Is Complicated and Slow</strong></h3>
  <p>Many believe that the buying procedure in Marrakech is complicated or lengthy. While it is a lengthy process, using knowledgeable real estate professionals and legal experts can simplify the process dramatically.</p>

  <h3 style="font-weight: bold;"><strong>Myth 5: Property Ownership Rights Are Limited for Foreigners</strong></h3>
  <p>Another myth states that foreigners enjoy limited rights of ownership in Marrakech. Actually, Moroccan law protects property ownership for everyone equally. It is crucial, however, to ensure that all documents are in compliance with local laws.</p>

  <h3 style="font-weight: bold;"><strong>Conclusion</strong></h3>
  <p>Uncovering the myths that surround purchasing property in Marrakech will clarify the procedure and legal framework. Buyers who are educated and collaborate with experts lower the risk and increase the chances of making a profitable investment.</p>

  <p><strong>Interested in buying property in Marrakech?</strong> Contact GateOne for expert guidance. We help clients navigate the market with accurate information and reliable support.</p>
</section>

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
