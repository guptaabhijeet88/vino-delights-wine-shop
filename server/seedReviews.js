const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const Product = require('./models/Product');
const Review = require('./models/Review');
const User = require('./models/User');

const reviewerNames = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@vino.com' },
  { name: 'Priya Patel', email: 'priya.patel@vino.com' },
  { name: 'Rohan Mehta', email: 'rohan.mehta@vino.com' },
  { name: 'Ananya Singh', email: 'ananya.singh@vino.com' },
  { name: 'Vikram Reddy', email: 'vikram.reddy@vino.com' },
  { name: 'Neha Gupta', email: 'neha.gupta@vino.com' },
  { name: 'Arjun Nair', email: 'arjun.nair@vino.com' },
];

// Reviews templates — {WINE} will be replaced with the actual wine name
const reviewTemplates = [
  // 5 star reviews
  {
    rating: 5,
    titles: [
      'Absolutely stunning wine!',
      'Best wine I have ever tasted',
      'Worth every single rupee',
      'A truly unforgettable experience',
      'Perfect in every way',
    ],
    comments: [
      'I ordered {WINE} for my anniversary dinner and it was the highlight of the evening. The flavours are so rich and complex, every sip felt like a celebration. Will definitely be ordering again!',
      'This is hands down the best wine I have tasted in years. The aroma itself is so inviting, and the taste just blows you away. My friends were all asking where I got it from. Highly recommended!',
      'I was a bit hesitant about the price but trust me, {WINE} is worth every rupee. The quality is exceptional and the packaging was beautiful too. Gifted one to my dad and he loved it.',
      'We opened this bottle at our house party and everyone was impressed. The smoothness and the depth of flavour is something else. {WINE} has become my go-to for special occasions now.',
      'I have been exploring wines for a couple of years now and this one stands out. The balance between the fruity notes and the oakiness is perfection. Superb quality!',
    ]
  },
  // 4 star reviews
  {
    rating: 4,
    titles: [
      'Really good wine, impressed!',
      'Great choice for dinner parties',
      'Very elegant and smooth',
      'Lovely wine, will buy again',
      'Excellent quality for the price',
    ],
    comments: [
      'Tried {WINE} with some grilled kebabs and the pairing was amazing. The wine has a lovely character and goes really well with Indian food. Taking off one star only because delivery took a bit long.',
      'I am not a wine expert but even I could tell this is quality stuff. Shared it with my wife over dinner and we both loved it. The aftertaste is so smooth and pleasant.',
      'Ordered this for a get-together with college friends. Everyone enjoyed it and a couple of them even placed their own orders after tasting it. {WINE} definitely makes an impression!',
      'Very nice wine with beautiful colour and aroma. I let it breathe for about 30 minutes before serving and it made a huge difference. The flavours really opened up beautifully.',
      'Good quality wine that does not disappoint. I have been buying from Vino Delights for a while now and the consistency is always there. {WINE} is a solid pick.',
    ]
  },
  // 4 star reviews (more variety)
  {
    rating: 4,
    titles: [
      'Pleasantly surprised',
      'A wonderful addition to my collection',
      'Smooth and delightful',
      'Great wine for the price point',
      'Really enjoyed this one',
    ],
    comments: [
      'I was not sure what to expect with {WINE} but it turned out to be a fantastic choice. The taste profile is complex yet approachable. Perfect for someone who wants to try something premium.',
      'Opened this bottle on a quiet Saturday evening with some cheese and crackers. It was the perfect combination. The wine is smooth with just the right amount of body.',
      'My father-in-law is quite particular about his wines and even he gave this a thumbs up. That says a lot! {WINE} has a refined taste that even connoisseurs will appreciate.',
      'Nice packaging, great taste, and fast delivery. What more can you ask for? I am slowly building my wine collection and this one definitely earned its spot on the shelf.',
      'Tried this wine at a friend\'s place first and immediately knew I had to get one for myself. The flavour is rich without being overwhelming. Very well balanced.',
    ]
  },
  // 5 star reviews (more variety)
  {
    rating: 5,
    titles: [
      'This wine is pure magic!',
      'Cannot recommend enough',
      'Made my evening special',
      'Top notch quality',
      'A masterpiece in a bottle',
    ],
    comments: [
      'From the moment I opened the bottle, the aroma filled the room. {WINE} is genuinely one of the best wines I have come across. Paired it with some paneer tikka and it was divine!',
      'I gifted this to my boss for his birthday and he called me the next day to thank me. Said it was one of the finest wines he has had. Glad I picked {WINE}, it made a great impression.',
      'My wife and I celebrated our anniversary with this wine and honestly it made the night so special. The smoothness, the flavour, everything about {WINE} screams quality.',
      'As someone who has tried wines from all over the world, I can confidently say this competes with the best. The craftsmanship is evident in every sip. Brilliant!',
      'Ordered two bottles — one for myself and one as a gift. Both were consumed within the week because they were that good! The taste lingers beautifully and leaves you wanting more.',
    ]
  },
  // 3 star reviews
  {
    rating: 3,
    titles: [
      'Decent wine, nothing extraordinary',
      'Good but expected more',
      'Average experience',
      'Its okay for casual drinking',
      'Fair enough for the price',
    ],
    comments: [
      '{WINE} is an okay wine. Nothing wrong with it but nothing that blew me away either. Maybe I had higher expectations because of the reviews. Its perfectly fine for casual evenings.',
      'The taste is decent but I felt like it lacked a bit of depth. For the price point, I have had better options. That said, the packaging was nice and delivery was quick.',
      'Had this with dinner and it was fine. Not something I would specifically seek out again but I would not say no if someone offered it. {WINE} is a safe middle-ground choice.',
      'I think this wine needs some time to breathe before you drink it. First glass was average but it got better after 20 minutes. Not bad overall, just not a standout.',
      'Good for everyday drinking but I would not call it a premium experience. The aroma is nice though and the colour is beautiful. Maybe I will try a different variety next time.',
    ]
  },
  // 5 star reviews (more)
  {
    rating: 5,
    titles: [
      'Exceeded all expectations!',
      'A gem of a wine',
      'The perfect gift choice',
      'Blown away by the quality',
      'Five stars is not enough!',
    ],
    comments: [
      'I am so glad I discovered {WINE} through Vino Delights. It has become a staple in our home now. Every guest we serve it to absolutely loves it. The quality is consistently excellent.',
      'Bought {WINE} for Diwali gifting and received so many compliments! Three of my relatives have already asked me where to order from. This wine speaks for itself.',
      'The first sip and I knew this was something special. You can taste the care that has gone into making {WINE}. It pairs beautifully with Indian cuisine, especially rich curries.',
      'My wine club friends and I did a blind tasting last month and {WINE} came out on top. Everyone was surprised by how good it was. A true hidden gem!',
      'I have been drinking wine for over 15 years and I must say {WINE} is exceptional. The nose is fragrant, the palate is complex, and the finish is long and elegant. Bravo!',
    ]
  },
  // 4 star reviews (more)
  {
    rating: 4,
    titles: [
      'Very good wine overall',
      'Solid choice, no complaints',
      'Would recommend to friends',
      'Happy with this purchase',
      'Good quality, nice taste',
    ],
    comments: [
      'Had {WINE} with some grilled tandoori chicken and the combination was perfect. The wine has enough body to stand up to bold flavours. Really happy with this purchase.',
      'Ordered this on a whim and was pleasantly surprised by the quality. {WINE} is a great everyday premium wine. Not too heavy, not too light — just right.',
      'The taste is clean and refined with a nice long finish. I have already added it to my favourites and will be reordering soon. Vino Delights packaging was also top notch.',
      'Shared this with my neighbours during a house warming party. Got lots of compliments and requests for the link! {WINE} definitely makes you look like you know your wines.',
      'A very enjoyable wine that I have now purchased three times. Consistent quality every time. Would like to see more varieties like this on the website.',
    ]
  },
];

async function seedReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing reviews from seed users
    const existingUsers = await User.find({ email: { $in: reviewerNames.map(r => r.email) } });
    if (existingUsers.length > 0) {
      await Review.deleteMany({ user: { $in: existingUsers.map(u => u._id) } });
      console.log('🗑️  Cleared old seed reviews');
    }

    // Create or find reviewer users
    const reviewers = [];
    for (const reviewer of reviewerNames) {
      let user = await User.findOne({ email: reviewer.email });
      if (!user) {
        user = new User({
          name: reviewer.name,
          email: reviewer.email,
          password: 'review123'
        });
        await user.save();
        console.log(`👤 Created reviewer: ${reviewer.name}`);
      }
      reviewers.push(user);
    }

    // Get all products
    const products = await Product.find({});
    console.log(`\n🍷 Found ${products.length} products. Adding 7 reviews each...\n`);

    let totalReviews = 0;

    for (const product of products) {
      // Shuffle templates for variety
      const shuffled = [...reviewTemplates].sort(() => Math.random() - 0.5);

      for (let i = 0; i < 7; i++) {
        const reviewer = reviewers[i];
        const template = shuffled[i];
        const titleIdx = Math.floor(Math.random() * template.titles.length);
        const commentIdx = Math.floor(Math.random() * template.comments.length);

        const review = new Review({
          user: reviewer._id,
          product: product._id,
          rating: template.rating,
          title: template.titles[titleIdx],
          comment: template.comments[commentIdx].replace(/\{WINE\}/g, product.name),
        });

        await review.save();
        totalReviews++;
      }

      console.log(`  ✅ ${product.name} — 7 reviews added`);
    }

    console.log(`\n🎉 Done! Added ${totalReviews} reviews across ${products.length} products.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedReviews();
