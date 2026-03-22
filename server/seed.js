const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const Product = require('./models/Product');
const Review = require('./models/Review');
const User = require('./models/User');

const wines = [
  // ====== RED WINES ======
  {
    name: 'Château Margaux 2015',
    description: 'A legendary Bordeaux with velvety tannins, notes of blackcurrant, violet, and subtle oak. This Grand Cru Classé offers an extraordinary depth and complexity that lingers for minutes on the palate.',
    price: 8999,
    mrp: 11499,
    category: 'Red',
    region: 'Bordeaux, France',
    year: 2015,
    rating: 5,
    image: 'https://images.vivino.com/thumbs/ApnDgKkoFDALifUWfHflMQ_375x500.jpg',
    stock: 25,
    volume: '750ml',
    alcoholContent: '13.5%',
    featured: true
  },
  {
    name: 'Opus One 2018',
    description: 'A prestigious Napa Valley blend of Cabernet Sauvignon, Merlot, and Petit Verdot. Rich layers of dark cherry, cassis, and espresso create a wine of remarkable elegance.',
    price: 12499,
    mrp: 15999,
    category: 'Red',
    region: 'Napa Valley, USA',
    year: 2018,
    rating: 5,
    image: 'https://images.vivino.com/thumbs/NAxIR3keSCqK-gSPMkJKKQ_375x500.jpg',
    stock: 15,
    volume: '750ml',
    alcoholContent: '14.5%',
    featured: true
  },
  {
    name: 'Sassicaia 2019',
    description: 'Italy\'s most famous Super Tuscan. Deep ruby with intense aromas of ripe berries, Mediterranean herbs, and fine leather. A masterpiece of Italian winemaking.',
    price: 7599,
    mrp: 9499,
    category: 'Red',
    region: 'Tuscany, Italy',
    year: 2019,
    rating: 4.8,
    image: 'https://images.vivino.com/thumbs/3ALsDGfXR0OBiV8J3GVb4g_375x500.jpg',
    stock: 30,
    volume: '750ml',
    alcoholContent: '14%',
    featured: true
  },
  {
    name: 'Penfolds Grange 2017',
    description: 'Australia\'s most celebrated wine. A powerful Shiraz with deep concentration of dark fruits, chocolate, spice, and seasoned oak. Built for decades of cellaring.',
    price: 14999,
    mrp: 18999,
    category: 'Red',
    region: 'South Australia',
    year: 2017,
    rating: 4.9,
    image: 'https://images.vivino.com/thumbs/NLkE2PteT98TJ_FXSG2p1A_375x500.jpg',
    stock: 12,
    volume: '750ml',
    alcoholContent: '14.5%',
    featured: true
  },
  {
    name: 'Barolo Riserva 2016',
    description: 'The King of Italian wines. Garnet-hued with enchanting aromas of dried rose, tar, truffle, and dried cherry. Powerful yet graceful with firm tannins and extraordinary length.',
    price: 5999,
    mrp: 7499,
    category: 'Red',
    region: 'Piedmont, Italy',
    year: 2016,
    rating: 4.7,
    image: 'https://images.vivino.com/thumbs/qX4KAYPwQ0u-sGfVq-C61Q_375x500.jpg',
    stock: 28,
    volume: '750ml',
    alcoholContent: '14%',
    featured: false
  },
  {
    name: 'Rioja Gran Reserva 2014',
    description: 'A classic Spanish red aged for 5 years in oak and bottle. Rich layers of dark fruit, vanilla, tobacco, and baking spices with silky smooth tannins.',
    price: 3499,
    mrp: 4299,
    category: 'Red',
    region: 'Rioja, Spain',
    year: 2014,
    rating: 4.5,
    image: 'https://images.vivino.com/thumbs/F6bBJ3JzTpiJ-S0Klf3oXQ_375x500.jpg',
    stock: 45,
    volume: '750ml',
    alcoholContent: '13.5%',
    featured: false
  },
  {
    name: 'Malbec Reserve 2020',
    description: 'An outstanding Argentine Malbec with intense violet color. Aromas of ripe plum, blackberry, and dark chocolate with a velvety finish and hints of vanilla.',
    price: 2799,
    mrp: 3499,
    category: 'Red',
    region: 'Mendoza, Argentina',
    year: 2020,
    rating: 4.4,
    image: 'https://images.vivino.com/thumbs/L1Fy9hYySU-twid1V_FYGA_375x500.jpg',
    stock: 60,
    volume: '750ml',
    alcoholContent: '14%',
    featured: false
  },
  {
    name: 'Pinot Noir Reserve 2021',
    description: 'An elegant Oregon Pinot Noir with delicate aromas of wild strawberry, cherry blossom, and earthy undertones. Light-bodied with remarkable finesse and a silky finish.',
    price: 4299,
    mrp: 5499,
    category: 'Red',
    region: 'Willamette Valley, USA',
    year: 2021,
    rating: 4.6,
    image: 'https://images.vivino.com/thumbs/ODAp2U7TwEatg_FVK7G4Dw_375x500.jpg',
    stock: 35,
    volume: '750ml',
    alcoholContent: '13%',
    featured: false
  },

  // ====== WHITE WINES ======
  {
    name: 'Cloudy Bay Sauvignon Blanc',
    description: 'A benchmark New Zealand white with vibrant citrus, passionfruit, and fresh-cut herb aromatics. Remarkably crisp with a pure, lingering finish.',
    price: 3299,
    mrp: 4199,
    category: 'White',
    region: 'Marlborough, New Zealand',
    year: 2022,
    rating: 4.5,
    image: 'https://images.vivino.com/thumbs/rMsv88a-Rnt4yKLZLgdHUQ_375x500.jpg',
    stock: 60,
    volume: '750ml',
    alcoholContent: '13%',
    featured: true
  },
  {
    name: 'Puligny-Montrachet Premier Cru',
    description: 'A sublime Burgundy white with notes of honeyed almonds, white peach, and mineral elegance. Beautifully balanced with a silky texture and remarkable length.',
    price: 6499,
    mrp: 7999,
    category: 'White',
    region: 'Burgundy, France',
    year: 2020,
    rating: 4.7,
    image: 'https://images.vivino.com/thumbs/XVg6NVZYR5Oqlc261WVp-Q_375x500.jpg',
    stock: 20,
    volume: '750ml',
    alcoholContent: '13.5%',
    featured: true
  },
  {
    name: 'Chablis Grand Cru 2019',
    description: 'A stunning expression of pure Chardonnay from Burgundy\'s iconic limestone slopes. Flinty minerality meets ripe citrus and green apple with a vibrant, long finish.',
    price: 5299,
    mrp: 6599,
    category: 'White',
    region: 'Chablis, France',
    year: 2019,
    rating: 4.6,
    image: 'https://images.vivino.com/thumbs/5v2JIsGzRpiXatOA5BRs7g_375x500.jpg',
    stock: 22,
    volume: '750ml',
    alcoholContent: '13%',
    featured: false
  },
  {
    name: 'Gavi di Gavi 2022',
    description: 'A refined Italian white from Piedmont made with Cortese grapes. Crisp, refreshing with notes of lime zest, white peach, and almond blossom.',
    price: 2199,
    mrp: 2799,
    category: 'White',
    region: 'Piedmont, Italy',
    year: 2022,
    rating: 4.2,
    image: 'https://images.vivino.com/thumbs/yezyBMEASbiYY50X52bJwA_375x500.jpg',
    stock: 50,
    volume: '750ml',
    alcoholContent: '12.5%',
    featured: false
  },
  {
    name: 'Grüner Veltliner Reserve',
    description: 'Austria\'s signature white wine with peppery spice, white pepper, citrus, and fresh herb notes. Vibrant acidity and mineral-driven finish.',
    price: 2899,
    mrp: 3599,
    category: 'White',
    region: 'Wachau, Austria',
    year: 2021,
    rating: 4.3,
    image: 'https://images.vivino.com/thumbs/Qpae7B1bTFqFHAnepZ-EYA_375x500.jpg',
    stock: 40,
    volume: '750ml',
    alcoholContent: '12.5%',
    featured: false
  },

  // ====== ROSÉ WINES ======
  {
    name: 'Whispering Angel Rosé',
    description: 'The world\'s most sought-after rosé from Provence. Pale pink with delicate aromas of fresh strawberry, peach, and rose petals. Perfectly refreshing and sophisticated.',
    price: 2899,
    mrp: 3599,
    category: 'Rosé',
    region: 'Provence, France',
    year: 2023,
    rating: 4.4,
    image: 'https://images.vivino.com/thumbs/VxgFCjE4RhmNxAqz80V00w_375x500.jpg',
    stock: 80,
    volume: '750ml',
    alcoholContent: '12.5%',
    featured: true
  },
  {
    name: 'Miraval Rosé 2023',
    description: 'From the estate owned by Brad Pitt in Provence. Beautiful salmon-pink color with aromas of fresh berries, melon, and white flowers. Crisp and elegant on the palate.',
    price: 3499,
    mrp: 4299,
    category: 'Rosé',
    region: 'Provence, France',
    year: 2023,
    rating: 4.5,
    image: 'https://images.vivino.com/thumbs/09ipC_SLRIS3E2rMN8nzwA_375x500.jpg',
    stock: 55,
    volume: '750ml',
    alcoholContent: '13%',
    featured: false
  },
  {
    name: 'Rosé d\'Anjou Loire',
    description: 'A delightful semi-sweet rosé from the Loire Valley. Bright pink with flavors of ripe raspberry, candy apple, and a touch of sweetness balanced by refreshing acidity.',
    price: 1899,
    mrp: 2399,
    category: 'Rosé',
    region: 'Loire Valley, France',
    year: 2023,
    rating: 4.1,
    image: 'https://images.vivino.com/thumbs/kj0jTRCpTGmsNnqR-mAm6Q_375x500.jpg',
    stock: 70,
    volume: '750ml',
    alcoholContent: '11%',
    featured: false
  },

  // ====== SPARKLING WINES ======
  {
    name: 'Dom Pérignon 2012',
    description: 'The iconic Champagne that defines luxury. Brilliant gold with persistent fine bubbles, layered notes of citrus, brioche, white flowers, and a majestic toasty finish.',
    price: 18999,
    mrp: 23999,
    category: 'Sparkling',
    region: 'Champagne, France',
    year: 2012,
    rating: 5,
    image: 'https://images.vivino.com/thumbs/BhPJEmtGTcOmzC-fIZHYlQ_375x500.jpg',
    stock: 10,
    volume: '750ml',
    alcoholContent: '12.5%',
    featured: true
  },
  {
    name: 'Veuve Clicquot Brut',
    description: 'A classic Champagne with golden hue and fine bubbles. Aromas of ripe apple, fresh brioche, and vanilla with a beautifully balanced palate and elegant finish.',
    price: 5499,
    mrp: 6999,
    category: 'Sparkling',
    region: 'Champagne, France',
    year: 2020,
    rating: 4.6,
    image: 'https://images.vivino.com/thumbs/PNJIUmJyRlCX_cztr1cNRQ_375x500.jpg',
    stock: 45,
    volume: '750ml',
    alcoholContent: '12%',
    featured: true
  },
  {
    name: 'Prosecco Superiore DOCG',
    description: 'A premium Italian sparkling wine from the Valdobbiadene hills. Delicate bubbles with aromas of green apple, acacia flowers, and fresh pear. Light and festive.',
    price: 1999,
    mrp: 2499,
    category: 'Sparkling',
    region: 'Veneto, Italy',
    year: 2023,
    rating: 4.2,
    image: 'https://images.vivino.com/thumbs/RQ3nI-1_Rs2Fko0TYS6aVA_375x500.jpg',
    stock: 90,
    volume: '750ml',
    alcoholContent: '11.5%',
    featured: false
  },
  {
    name: 'Moët & Chandon Impérial',
    description: 'The world\'s most loved Champagne. Bright golden straw with elegant bubbles. Notes of green apple, citrus, and warm brioche lead to a lush, generous finish.',
    price: 4999,
    mrp: 6299,
    category: 'Sparkling',
    region: 'Champagne, France',
    year: 2021,
    rating: 4.5,
    image: 'https://images.vivino.com/thumbs/U5I-0Kfa3EWl0rJFv-uNNQ_375x500.jpg',
    stock: 38,
    volume: '750ml',
    alcoholContent: '12%',
    featured: true
  },

  // ====== DESSERT WINES ======
  {
    name: 'Riesling Spätlese',
    description: 'A stunning German late-harvest Riesling with honeyed stone fruit, delicate floral notes, and refreshing acidity. Perfect harmony of sweetness and minerality.',
    price: 2499,
    mrp: 3099,
    category: 'Dessert',
    region: 'Mosel, Germany',
    year: 2021,
    rating: 4.3,
    image: 'https://images.vivino.com/thumbs/P74FGmmJT2u3p5EmfNvIKQ_375x500.jpg',
    stock: 55,
    volume: '750ml',
    alcoholContent: '8%',
    featured: false
  },
  {
    name: 'Sauternes Premier Cru',
    description: 'A heavenly dessert wine with luscious notes of apricot, honey, vanilla, and candied citrus. Rich and concentrated with balancing acidity for a never-ending finish.',
    price: 4999,
    mrp: 6299,
    category: 'Dessert',
    region: 'Bordeaux, France',
    year: 2018,
    rating: 4.6,
    image: 'https://images.vivino.com/thumbs/KkxiRJpjR1KJGojjLFo8sw_375x500.jpg',
    stock: 18,
    volume: '375ml',
    alcoholContent: '14%',
    featured: false
  },
  {
    name: 'Tokaji Aszú 5 Puttonyos',
    description: 'Hungary\'s legendary golden nectar. Intense aromas of dried apricot, orange marmalade, and saffron with a rich, honeyed palate balanced by vibrant acidity.',
    price: 5799,
    mrp: 7299,
    category: 'Dessert',
    region: 'Tokaj, Hungary',
    year: 2017,
    rating: 4.7,
    image: 'https://images.vivino.com/thumbs/TMfyIQK_TsK0VUAg8NK-Zg_375x500.jpg',
    stock: 14,
    volume: '500ml',
    alcoholContent: '11%',
    featured: false
  },
  {
    name: 'Port Ruby Reserve',
    description: 'A rich Portuguese fortified wine with deep ruby color. Intense flavors of blackberry, plum jam, and dark chocolate with a warming, lingering finish. Perfect after dinner.',
    price: 3199,
    mrp: 3999,
    category: 'Dessert',
    region: 'Douro Valley, Portugal',
    year: 2019,
    rating: 4.4,
    image: 'https://images.vivino.com/thumbs/4RhKt6HS6VK-0ldiU2S8hA_375x500.jpg',
    stock: 32,
    volume: '750ml',
    alcoholContent: '20%',
    featured: false
  }
];

// Sample reviews with realistic human language
const sampleReviews = [
  {
    wineName: 'Château Margaux 2015', reviews: [
      { rating: 5, title: 'Absolutely magnificent wine', comment: 'Opened this for our anniversary and it completely blew us away. The tannins are so smooth and velvety, you could almost drink this without food. The blackcurrant and violet notes are right there, but what surprised me was this subtle smoky cedar flavor that kept emerging. Worth every single rupee.' },
      { rating: 5, title: 'The best Bordeaux I have ever tasted', comment: 'I have been collecting wines for over fifteen years and this Margaux is something else entirely. It has this incredible depth that just keeps revealing new layers with every sip. My wife said it smelled like a garden in summer and honestly I agree. We finished the whole bottle in one evening.' },
      { rating: 4, title: 'Excellent but needs more time', comment: 'I probably opened this a bit too early. The wine is fantastic but I can tell it still has room to develop. The fruit is rich and the structure is beautiful, but the tannins are still a touch firm. Going to buy another bottle and cellar it for five more years.' }
    ]
  },
  {
    wineName: 'Opus One 2018', reviews: [
      { rating: 5, title: 'Pure luxury in a bottle', comment: 'Gifted this to my father for his 60th birthday. We decanted it for about two hours and the transformation was incredible. Dark cherry, espresso, and this beautiful chocolatey finish. He said it was the best gift he ever received and I believe him.' },
      { rating: 5, title: 'Worth the splurge', comment: 'I saved up for months to buy this bottle and it was worth every bit of the wait. The blend is so harmonious you cannot pick out individual grapes at all. It just tastes like pure elegance. Served it with a grilled ribeye steak and honestly we just sat in silence enjoying it.' },
      { rating: 4, title: 'Great representation of Napa', comment: 'If you want to understand what Napa Valley Cabernet blends are all about this is the bottle to try. Rich, powerful, but still refined. My only tiny complaint is the oak is a bit prominent right now but I think it will integrate beautifully with another year or two in the cellar.' }
    ]
  },
  {
    wineName: 'Dom Pérignon 2012', reviews: [
      { rating: 5, title: 'The champagne that changed my life', comment: 'I used to think champagne was just bubbly white wine until I tried Dom Pérignon. The complexity here is absolutely mind blowing. Brioche, toasted almonds, citrus, white flowers — everything comes together in perfect harmony. Opened this for New Years Eve and my guests could not stop talking about it.' },
      { rating: 5, title: 'Nothing else comes close', comment: 'We do a champagne tasting every Christmas with about eight different bottles and Dom always finishes on top. The 2012 vintage is particularly stunning with these gorgeous notes of honey and hazelnut. The bubbles are incredibly fine and the finish just goes on forever. This is what celebration tastes like.' }
    ]
  },
  {
    wineName: 'Cloudy Bay Sauvignon Blanc', reviews: [
      { rating: 5, title: 'Summer in a glass', comment: 'This is hands down my favorite white wine for warm weather. The passionfruit and citrus just explode from the glass the moment you pour it. So crisp and refreshing you want to drink the whole bottle immediately. Paired it with grilled prawns and lime and it was a match made in heaven.' },
      { rating: 4, title: 'Always reliable, always delicious', comment: 'I have bought probably a dozen bottles of Cloudy Bay over the years and it never disappoints. Fresh, zesty, loads of tropical fruit character. The only reason I am giving four stars instead of five is that I have tried some boutique NZ Sauvignon Blancs that push even further in terms of intensity.' },
      { rating: 4, title: 'Great everyday luxury wine', comment: 'Not the cheapest Sauv Blanc out there but for the quality you get it is absolutely worth it. I always keep a bottle chilled in the fridge for impromptu gatherings. Everyone loves it and I have converted several friends into regular Cloudy Bay buyers.' }
    ]
  },
  {
    wineName: 'Whispering Angel Rosé', reviews: [
      { rating: 5, title: 'The perfect rosé honestly', comment: 'I have tried dozens of rosé wines and Whispering Angel is the one I keep coming back to. That pale pink color is gorgeous and the taste is just perfect — fresh strawberry, a hint of peach, and this lovely delicate finish. We drink this by the pool every summer weekend and it never gets old.' },
      { rating: 4, title: 'Beautiful wine, great packaging too', comment: 'The bottle itself is stunning and makes a great gift. The wine inside is equally impressive with lovely fruit flavors and great freshness. Served ice cold on a hot day and it disappeared in about thirty minutes between four of us. Will definitely be ordering more.' }
    ]
  },
  {
    wineName: 'Sassicaia 2019', reviews: [
      { rating: 5, title: 'Italian winemaking at its absolute finest', comment: 'This Super Tuscan completely delivered on its legendary reputation. Deep intense ruby color with aromas that made me close my eyes and just breathe in for a full minute. Ripe berries, Mediterranean herbs, and this gorgeous leather note. Paired it with homemade pasta bolognese and it was genuinely one of the best meals of my life.' },
      { rating: 4, title: 'Impressive but young', comment: 'Drank this on a Tuesday night because I could not wait any longer and while it was excellent it clearly has so much more potential. The fruit is dense and the herbs come through beautifully but the tannins still need some softening. Planning to buy a case and revisit every couple of years.' }
    ]
  },
  {
    wineName: 'Penfolds Grange 2017', reviews: [
      { rating: 5, title: 'Australian perfection', comment: 'This is hands down the best Shiraz I have ever tasted. The concentration of dark fruit is incredible and the chocolate and spice notes add this amazing complexity. Let it breathe for at least an hour, trust me the difference is night and day.' },
      { rating: 5, title: 'A wine that demands respect', comment: 'Splashed out on this for my birthday and it was the best decision I have ever made. The depth and power is almost overwhelming in the best way possible. Every sip reveals something new. This is a wine you want to sit with slowly and savour every drop.' }
    ]
  },
  {
    wineName: 'Barolo Riserva 2016', reviews: [
      { rating: 5, title: 'The King of wines lives up to its name', comment: 'Absolutely spellbinding wine. That garnet color in the glass is already beautiful but the nose is where it really shines. Dried roses, truffles, cherries — it smells like walking through an Italian marketplace in autumn. The tannins are powerful but so refined. This wine demands your attention and rewards it generously.' }
    ]
  },
  {
    wineName: 'Veuve Clicquot Brut', reviews: [
      { rating: 5, title: 'Never fails to impress', comment: 'We always have a bottle of Veuve for celebrations and it never disappoints. Beautiful golden color, fine persistent bubbles, and that signature Veuve flavor of ripe apple baked brioche and vanilla. Opened one for our housewarming party and it set the perfect tone for the evening.' },
      { rating: 4, title: 'Solid champagne for the price', comment: 'You know exactly what you are getting with Veuve and that consistency is what makes it great. Not as complex as Dom or Krug but for everyday celebrations it is perfect. The brut style is dry without being harsh and pairs well with just about anything from oysters to fried chicken.' }
    ]
  },
  {
    wineName: 'Puligny-Montrachet Premier Cru', reviews: [
      { rating: 5, title: 'White Burgundy at its absolute peak', comment: 'I am speechless. This wine is pure silk in a glass. The honeyed almond and white peach notes are so delicate you feel like you are tasting something precious. Paired it with pan-seared scallops and the combination was magical. If you love white wine, this is THE bottle to try.' },
      { rating: 4, title: 'Stunning quality, will age beautifully', comment: 'Already showing incredible elegance but I suspect this will be even better in three to five years. The mineral backbone is superb and the texture is like liquid velvet. Worth every penny for a special occasion.' }
    ]
  },
  {
    wineName: 'Moët & Chandon Impérial', reviews: [
      { rating: 5, title: 'The classic for a reason', comment: 'There is a reason Moët is the most recognised champagne brand in the world. This Impérial is all about consistency and class. Green apple, citrus, that gorgeous brioche note. Perfect for toasting anything from promotions to engagements to just being alive on a Friday night.' },
      { rating: 4, title: 'Dependably delicious', comment: 'My go-to champagne when I want to celebrate without overthinking it. The bubbles are lively, the flavour is clean and refreshing, and the finish is satisfyingly long. Cannot ask for more at this price point.' }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    await Review.deleteMany({});
    console.log('🗑️  Cleared existing reviews');

    const products = await Product.insertMany(wines);
    console.log(`🍷 Seeded ${products.length} premium wines`);

    // Create admin user if not exists
    let adminUser;
    const existingAdmin = await User.findOne({ email: 'admin@vino.com' });
    if (!existingAdmin) {
      adminUser = new User({
        name: 'Admin',
        email: 'admin@vino.com',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('👑 Admin user created (admin@vino.com / admin123)');
    } else {
      adminUser = existingAdmin;
      console.log('👑 Admin user already exists');
    }

    // Create sample reviewer users
    const reviewerNames = [
      { name: 'Arjun Mehta', email: 'arjun@example.com' },
      { name: 'Sophia Laurent', email: 'sophia@example.com' },
      { name: 'Rahul Kapoor', email: 'rahul@example.com' },
      { name: 'Emma Chen', email: 'emma@example.com' },
      { name: 'Vikram Singh', email: 'vikram@example.com' }
    ];

    const reviewerUsers = [];
    for (const reviewer of reviewerNames) {
      let user = await User.findOne({ email: reviewer.email });
      if (!user) {
        user = new User({
          name: reviewer.name,
          email: reviewer.email,
          password: 'password123'
        });
        await user.save();
      }
      reviewerUsers.push(user);
    }
    console.log(`👥 ${reviewerUsers.length} reviewer users ready`);

    // Seed reviews
    let reviewCount = 0;
    for (const item of sampleReviews) {
      const product = products.find(p => p.name === item.wineName);
      if (!product) continue;

      for (let i = 0; i < item.reviews.length; i++) {
        const reviewData = item.reviews[i];
        const user = reviewerUsers[i % reviewerUsers.length];

        const existingReview = await Review.findOne({
          user: user._id,
          product: product._id
        });
        if (!existingReview) {
          await Review.create({
            user: user._id,
            product: product._id,
            rating: reviewData.rating,
            title: reviewData.title,
            comment: reviewData.comment
          });
          reviewCount++;
        }
      }
    }
    console.log(`📝 Seeded ${reviewCount} product reviews`);

    await mongoose.connection.close();
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seed();
