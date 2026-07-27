const fs = require('fs');

const dataFile = 'data/products.json';
const publicDataFile = 'public/data/products.json';

const currentData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const newProducts = [
  {
    "id": "p-013",
    "slug": "golden-vanilla",
    "name": { "en": "Golden Vanilla", "ar": "جولدن فانيليا" },
    "brand": "Inspired by Tom Ford Tobacco Vanille",
    "gender": "him",
    "price": 899,
    "oldPrice": null,
    "description": { "en": "Opulent, warm and iconic. A modern take on an old-world men's club.", "ar": "فاخر، دافئ وأيقوني. لمسة عصرية لنادي الرجال القديم." },
    "notes": {
      "top": { "en": "Tobacco Leaf, Spicy Notes", "ar": "ورق التبغ، نفحات حارة" },
      "middle": { "en": "Vanilla, Cacao, Tonka Bean", "ar": "فانيليا، كاكاو، تونكا" },
      "base": { "en": "Dried Fruits, Woody Notes", "ar": "فواكه مجففة، نفحات خشبية" }
    },
    "image": "golden-vanilla.jpg",
    "rating": 4.8,
    "reviewsCount": 210,
    "isNew": true,
    "isBestseller": false
  },
  {
    "id": "p-014",
    "slug": "mystic-wood",
    "name": { "en": "Mystic Wood", "ar": "ميستيك وود" },
    "brand": "Inspired by Tom Ford Oud Wood",
    "gender": "him",
    "price": 999,
    "oldPrice": 1250,
    "description": { "en": "Rare, exotic, and distinctive. One of the most rare, precious, and expensive ingredients in a perfumer's arsenal.", "ar": "نادر، غريب، ومميز. واحد من أندر وأغلى المكونات في ترسانة العطار." },
    "notes": {
      "top": { "en": "Rosewood, Cardamom", "ar": "خشب الورد، هيل" },
      "middle": { "en": "Oud Wood, Sandalwood, Vetiver", "ar": "خشب العود، خشب الصندل، نجيل الهند" },
      "base": { "en": "Tonka Bean, Amber", "ar": "تونكا، عنبر" }
    },
    "image": "mystic-wood.jpg",
    "rating": 4.9,
    "reviewsCount": 425,
    "isNew": false,
    "isBestseller": true
  },
  {
    "id": "p-015",
    "slug": "savage",
    "name": { "en": "Savage", "ar": "سافاج" },
    "brand": "Inspired by Dior Sauvage",
    "gender": "him",
    "price": 899,
    "oldPrice": 1100,
    "description": { "en": "A radically fresh composition, dictated by a name that has the ring of a manifesto.", "ar": "تركيبة منعشة جذرياً، تمليها اسم يرن كبيان." },
    "notes": {
      "top": { "en": "Calabrian Bergamot, Pepper", "ar": "برغموت كالابريا، فلفل" },
      "middle": { "en": "Sichuan Pepper, Lavender, Vetiver", "ar": "فلفل سيتشوان، لافندر، نجيل الهند" },
      "base": { "en": "Ambroxan, Cedar", "ar": "أمبروكسان، خشب الأرز" }
    },
    "image": "savage.jpg",
    "rating": 4.7,
    "reviewsCount": 890,
    "isNew": false,
    "isBestseller": true
  },
  {
    "id": "p-016",
    "slug": "secret-garden",
    "name": { "en": "Secret Garden", "ar": "سيكريت جاردن" },
    "brand": "Inspired by CH Good Girl",
    "gender": "her",
    "price": 899,
    "oldPrice": null,
    "description": { "en": "A daring yet sophisticated fragrance inspired by the duality of the modern woman.", "ar": "عطر جريء وراقي مستوحى من ازدواجية المرأة العصرية." },
    "notes": {
      "top": { "en": "Almond, Coffee, Bergamot", "ar": "لوز، قهوة، برغموت" },
      "middle": { "en": "Tuberose, Jasmine Sambac", "ar": "مسك الروم، ياسمين سامباك" },
      "base": { "en": "Tonka Bean, Cacao, Vanilla", "ar": "تونكا، كاكاو، فانيليا" }
    },
    "image": "secret-garden.jpg",
    "rating": 4.8,
    "reviewsCount": 350,
    "isNew": true,
    "isBestseller": false
  },
  {
    "id": "p-017",
    "slug": "crystal",
    "name": { "en": "Crystal", "ar": "كريستال" },
    "brand": "Inspired by Versace Bright Crystal",
    "gender": "her",
    "price": 899,
    "oldPrice": 1050,
    "description": { "en": "A precious jewel of rare beauty characterized by a fresh, vibrant, flowery scent.", "ar": "جوهرة ثمينة ذات جمال نادر تتميز برائحة منعشة، نابضة بالحياة، وزهرية." },
    "notes": {
      "top": { "en": "Yuzu, Pomegranate, Ice", "ar": "يوزو، رمان، ثلج" },
      "middle": { "en": "Peony, Lotus, Magnolia", "ar": "فاوانيا، لوتس، ماغنوليا" },
      "base": { "en": "Musk, Mahogany, Amber", "ar": "مسك، ماهوجني، عنبر" }
    },
    "image": "crystal.jpg",
    "rating": 4.6,
    "reviewsCount": 215,
    "isNew": false,
    "isBestseller": true
  },
  {
    "id": "p-018",
    "slug": "scandalous",
    "name": { "en": "Scandalous", "ar": "سكاندالوس" },
    "brand": "Inspired by JPG Scandal",
    "gender": "her",
    "price": 899,
    "oldPrice": null,
    "description": { "en": "A perfume that is designed to break all clichés, offering something new and modern, and at the same time powerful and elegant.", "ar": "عطر مصمم لكسر جميع الكليشيهات، ليقدم شيئاً جديداً وعصرياً، وفي نفس الوقت قوياً وأنيقاً." },
    "notes": {
      "top": { "en": "Blood Orange, Mandarin Orange", "ar": "برتقال دموي، يوسفي" },
      "middle": { "en": "Honey, Gardenia, Orange Blossom", "ar": "عسل، غاردينيا، زهر البرتقال" },
      "base": { "en": "Beeswax, Caramel, Patchouli", "ar": "شمع العسل، كراميل، باتشولي" }
    },
    "image": "scandalous.jpg",
    "rating": 4.7,
    "reviewsCount": 180,
    "isNew": true,
    "isBestseller": false
  }
];

const combined = [...currentData, ...newProducts];
const jsonStr = JSON.stringify(combined, null, 2);

fs.writeFileSync(dataFile, jsonStr);
fs.writeFileSync(publicDataFile, jsonStr);

console.log('Successfully added 6 new products!');
