const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

export type ProductSeedRow = {
  sku: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price: string;
  stock: number;
  imageUrl: string;
};

export const PRODUCTS_SEED_DATA: ProductSeedRow[] = [
  {
    sku: 'MKP-ELC-001',
    name: 'Logitech MX Master 3S Wireless Mouse',
    description:
      'Quiet-click ergonomic wireless mouse with an 8K DPI sensor, MagSpeed electromagnetic scrolling, and multi-device Bluetooth pairing. Ideal for long work sessions and creative workflows on macOS and Windows.',
    category: 'Electronics',
    tags: ['wireless', 'ergonomic', 'productivity', 'bluetooth'],
    price: '109.99',
    stock: 142,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-ELC-002',
    name: 'Keychron K2 Pro Hot-Swappable Mechanical Keyboard',
    description:
      'Compact 75% layout with gasket mount, RGB backlighting, and hot-swappable switches for easy customization. Connects via Bluetooth 5.1 or USB-C with multi-OS keycaps included.',
    category: 'Electronics',
    tags: ['mechanical', 'keyboard', 'rgb', 'bluetooth', 'usb-c'],
    price: '119.00',
    stock: 88,
    imageUrl: unsplash('1496181133206-80ce9b88a853'),
  },
  {
    sku: 'MKP-ELC-003',
    name: 'Dell UltraSharp U2723QE 27" 4K USB-C Monitor',
    description:
      'IPS Black panel with 2000:1 contrast, factory-calibrated color, and 90W USB-C power delivery. Includes KVM for switching between two PCs with one keyboard and mouse set.',
    category: 'Electronics',
    tags: ['4k', 'usb-c', 'ips', 'office', 'color-accurate'],
    price: '579.99',
    stock: 34,
    imageUrl: unsplash('1517336714731-489689fd1ca8'),
  },
  {
    sku: 'MKP-ELC-004',
    name: 'Anker 737 Power Bank (PowerCore 24K)',
    description:
      'High-capacity 24,000mAh portable charger with 140W two-way USB-C Power Delivery. Charges laptops, tablets, and phones quickly with a clear digital display for remaining power.',
    category: 'Electronics',
    tags: ['power-bank', 'usb-c', 'travel', 'pd'],
    price: '149.99',
    stock: 210,
    imageUrl: unsplash('1511707171634-5f897ff02aa9'),
  },
  {
    sku: 'MKP-ELC-005',
    name: 'Samsung T7 Shield 1TB Portable SSD',
    description:
      'Rugged IP65-rated external SSD with hardware encryption and read speeds up to 1,050 MB/s. Rubberized casing survives drops and keeps data safe in the field.',
    category: 'Electronics',
    tags: ['ssd', 'portable', 'encryption', 'rugged'],
    price: '119.99',
    stock: 156,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-ELC-006',
    name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    description:
      'Industry-leading noise cancellation with lightweight design and crystal-clear hands-free calling. Quick charge gives hours of playback from a short top-up.',
    category: 'Electronics',
    tags: ['headphones', 'noise-cancelling', 'wireless', 'travel'],
    price: '399.99',
    stock: 67,
    imageUrl: unsplash('1505740420928-5e560c06d30e'),
  },
  {
    sku: 'MKP-ELC-007',
    name: 'Apple AirPods Pro (2nd Generation) with MagSafe Case',
    description:
      'In-ear earbuds with adaptive transparency, personalized spatial audio, and active noise cancellation. USB-C charging case works seamlessly with iPhone and iPad.',
    category: 'Electronics',
    tags: ['earbuds', 'apple', 'spatial-audio', 'anc'],
    price: '249.00',
    stock: 192,
    imageUrl: unsplash('1505740420928-5e560c06d30e'),
  },
  {
    sku: 'MKP-ELC-008',
    name: 'Elgato Stream Deck MK.2 15-Key Studio Controller',
    description:
      'Programmable LCD keys trigger scenes, hotkeys, and macros in OBS, Zoom, and creative apps. Detachable stand and swappable faceplates for a clean desk setup.',
    category: 'Electronics',
    tags: ['streaming', 'macro', 'content-creator', 'usb'],
    price: '149.99',
    stock: 73,
    imageUrl: unsplash('1496181133206-80ce9b88a853'),
  },
  {
    sku: 'MKP-ELC-009',
    name: 'ASUS ProArt Display PA278CV 27" WQHD Creator Monitor',
    description:
      'Calibrated WQHD IPS panel with 100% sRGB and USB-C docking. Designed for photographers and video editors who need dependable color out of the box.',
    category: 'Electronics',
    tags: ['monitor', 'color', 'creator', 'usb-c'],
    price: '429.00',
    stock: 41,
    imageUrl: unsplash('1517336714731-489689fd1ca8'),
  },
  {
    sku: 'MKP-HNK-001',
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker (6 Quart)',
    description:
      'Multi-function cooker pressure cooks, sautés, steams, and makes yogurt with simple one-touch programs. Stainless inner pot is dishwasher safe for easy cleanup.',
    category: 'Home & Kitchen',
    tags: ['pressure-cooker', 'multi-cooker', 'stainless', 'family'],
    price: '99.95',
    stock: 124,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-002',
    name: 'Le Creuset Signature 5.5 Quart Round Dutch Oven',
    description:
      'Enameled cast iron retains heat evenly for braising, baking bread, and slow cooking. Chip-resistant enamel finish in classic colors for stovetop and oven use.',
    category: 'Home & Kitchen',
    tags: ['cast-iron', 'dutch-oven', 'braising', 'enameled'],
    price: '420.00',
    stock: 28,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-003',
    name: 'Dyson V15 Detect Cordless Vacuum',
    description:
      'Laser dust detection reveals microscopic particles on hard floors while an LCD screen shows real-time particle counts. Up to 60 minutes of fade-free suction.',
    category: 'Home & Kitchen',
    tags: ['vacuum', 'cordless', 'hepa', 'pet-hair'],
    price: '749.99',
    stock: 19,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-004',
    name: 'KitchenAid Artisan Series 5 Quart Tilt-Head Stand Mixer',
    description:
      'Iconic stand mixer with 10 speeds and compatibility with pasta rollers, grinders, and more attachments. Stable planetary mixing action handles dense dough with ease.',
    category: 'Home & Kitchen',
    tags: ['baking', 'mixer', 'attachments', 'countertop'],
    price: '449.99',
    stock: 52,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-005',
    name: 'OXO Good Grips 15-Piece Everyday Kitchen Tool Set',
    description:
      'Non-slip handles and heat-safe nylon tools for everyday cooking tasks. Includes spoons, turners, whisk, and storage crock that keeps counters organized.',
    category: 'Home & Kitchen',
    tags: ['utensils', 'nylon', 'starter-set', 'dishwasher-safe'],
    price: '79.99',
    stock: 201,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-006',
    name: 'Breville Barista Express Espresso Machine',
    description:
      'Integrated conical burr grinder doses directly into the portafilter for fresh espresso at home. Steam wand textures milk for latte art with practice.',
    category: 'Home & Kitchen',
    tags: ['espresso', 'coffee', 'grinder', 'steam-wand'],
    price: '749.95',
    stock: 33,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-007',
    name: 'Pyrex Glass Mixing Bowl Set (3-Piece)',
    description:
      'Oven-safe borosilicate glass bowls nest for storage and resist stains and odors. Microwave and dishwasher safe for prep, serving, and leftovers.',
    category: 'Home & Kitchen',
    tags: ['glassware', 'prep', 'microwave-safe', 'nesting'],
    price: '34.99',
    stock: 340,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-008',
    name: 'Simplehuman 45L Rectangular Step Trash Can',
    description:
      'Fingerprint-proof stainless steel with a silent-close lid and stay-open mode for longer chores. Custom fit liners slide in neatly without slipping.',
    category: 'Home & Kitchen',
    tags: ['trash-can', 'stainless', 'kitchen', 'hands-free'],
    price: '139.99',
    stock: 76,
    imageUrl: unsplash('1490481651871-ab68de25d43d'),
  },
  {
    sku: 'MKP-HNK-009',
    name: 'Brooklinen Luxe Core Sheet Set (Queen, White)',
    description:
      '480-thread-count long-staple cotton sateen with a smooth drape and breathable feel. Deep pockets fit mattresses up to 15 inches without slipping off corners.',
    category: 'Home & Kitchen',
    tags: ['bedding', 'cotton', 'sheets', 'queen'],
    price: '189.00',
    stock: 95,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-FAS-001',
    name: 'Patagonia Better Sweater Fleece Jacket (Men)',
    description:
      'Midweight recycled polyester fleece with a sweater-knit face and soft interior. Fair Trade sewn with zippered hand pockets and a stand-up collar for wind protection.',
    category: 'Fashion',
    tags: ['fleece', 'outdoor', 'recycled', 'layering'],
    price: '139.00',
    stock: 112,
    imageUrl: unsplash('1441986300917-64674bd600d8'),
  },
  {
    sku: 'MKP-FAS-002',
    name: 'Levi\'s 501 Original Fit Jeans (Medium Stonewash)',
    description:
      'Classic straight-leg denim with the original button fly and timeless five-pocket styling. Rigid denim breaks in over time for a personalized fit.',
    category: 'Fashion',
    tags: ['denim', 'jeans', 'classic', 'casual'],
    price: '69.50',
    stock: 260,
    imageUrl: unsplash('1441986300917-64674bd600d8'),
  },
  {
    sku: 'MKP-FAS-003',
    name: 'Nike Air Zoom Pegasus 40 Road Running Shoes',
    description:
      'Responsive cushioning and breathable engineered mesh for daily miles. Durable rubber outsole grips pavement in wet and dry conditions.',
    category: 'Fashion',
    tags: ['running', 'sneakers', 'cushioned', 'road'],
    price: '130.00',
    stock: 178,
    imageUrl: unsplash('1542291026-7eec264c27ff'),
  },
  {
    sku: 'MKP-FAS-004',
    name: 'Carhartt Acrylic Watch Hat (Black)',
    description:
      'Stretchable rib-knit beanie that stays warm without feeling bulky. A workwear staple that pairs with jackets and parkas in cold weather.',
    category: 'Fashion',
    tags: ['beanie', 'winter', 'workwear', 'unisex'],
    price: '19.99',
    stock: 410,
    imageUrl: unsplash('1441986300917-64674bd600d8'),
  },
  {
    sku: 'MKP-FAS-005',
    name: 'Ray-Ban New Wayfarer Classic Sunglasses',
    description:
      'Updated Wayfarer proportions with lightweight nylon frames and crystal lenses. Offers 100% UV protection with timeless style for everyday wear.',
    category: 'Fashion',
    tags: ['sunglasses', 'uv-protection', 'classic', 'nylon'],
    price: '171.00',
    stock: 89,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-FAS-006',
    name: 'Uniqlo Ultra Light Down Compact Jacket',
    description:
      'Packable down jacket that stows into an included pouch for travel. Water-repellent shell and responsibly sourced down fill for lightweight warmth.',
    category: 'Fashion',
    tags: ['down', 'packable', 'travel', 'lightweight'],
    price: '79.90',
    stock: 155,
    imageUrl: unsplash('1441986300917-64674bd600d8'),
  },
  {
    sku: 'MKP-FAS-007',
    name: 'Dr. Martens 1460 Smooth Leather Boots',
    description:
      'Eight-eye lace-up boots with Goodyear-welted construction and signature yellow stitching. Air-cushioned sole breaks in for years of wear.',
    category: 'Fashion',
    tags: ['boots', 'leather', 'streetwear', 'durable'],
    price: '170.00',
    stock: 64,
    imageUrl: unsplash('1472851294608-062f824d29cc'),
  },
  {
    sku: 'MKP-FAS-008',
    name: 'Everlane The Premium Leather Belt (Black)',
    description:
      'Full-grain Italian leather with a minimal buckle and clean lines. Sized for a precise fit and designed to age gracefully with regular wear.',
    category: 'Fashion',
    tags: ['leather', 'belt', 'accessories', 'minimal'],
    price: '75.00',
    stock: 133,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-001',
    name: 'CeraVe Hydrating Facial Cleanser (16 fl oz)',
    description:
      'Gentle non-foaming cleanser with ceramides and hyaluronic acid to support the skin barrier. Fragrance-free and accepted by the National Eczema Association.',
    category: 'Health & Beauty',
    tags: ['skincare', 'cleanser', 'ceramides', 'sensitive-skin'],
    price: '17.99',
    stock: 420,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-002',
    name: 'La Roche-Posay Anthelios SPF 50 Mineral Sunscreen',
    description:
      'Broad-spectrum UVA/UVB protection with a lightweight fluid texture that layers under makeup. Suitable for sensitive skin and daily outdoor use.',
    category: 'Health & Beauty',
    tags: ['sunscreen', 'spf', 'mineral', 'sensitive'],
    price: '36.99',
    stock: 288,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-003',
    name: 'Oral-B iO Series 9 Electric Toothbrush',
    description:
      'Magnetic drive delivers smooth micro-vibrations with a pressure sensor that protects gums. Smart display guides brushing time and coverage zones.',
    category: 'Health & Beauty',
    tags: ['oral-care', 'electric-toothbrush', 'bluetooth', 'dental'],
    price: '299.99',
    stock: 97,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-004',
    name: 'The Ordinary Niacinamide 10% + Zinc 1% Serum',
    description:
      'Water-based serum that supports clearer-looking skin and balances visible shine. Apply before heavier creams in your evening routine.',
    category: 'Health & Beauty',
    tags: ['serum', 'niacinamide', 'affordable', 'skincare'],
    price: '6.80',
    stock: 560,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-005',
    name: 'Olaplex No.3 Hair Perfector Treatment',
    description:
      'At-home bond-building treatment that reduces breakage between salon visits. Apply to damp hair before shampooing for stronger, shinier strands.',
    category: 'Health & Beauty',
    tags: ['hair-care', 'repair', 'salon', 'bond-building'],
    price: '30.00',
    stock: 214,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-006',
    name: 'Philips Norelco Shaver 9000 Prestige Wet/Dry Electric Shaver',
    description:
      'NanoTech precision blades follow facial contours with comfort rings that glide smoothly. Quick clean pod refreshes the shaver in seconds.',
    category: 'Health & Beauty',
    tags: ['shaving', 'electric-razor', 'wet-dry', 'grooming'],
    price: '319.99',
    stock: 48,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-007',
    name: 'Neutrogena Hydro Boost Water Gel Moisturizer',
    description:
      'Oil-free gel moisturizer with hyaluronic acid that absorbs quickly for long-lasting hydration. Works well under sunscreen during the day.',
    category: 'Health & Beauty',
    tags: ['moisturizer', 'hyaluronic', 'oil-free', 'daily'],
    price: '21.49',
    stock: 305,
    imageUrl: unsplash('1483985988355-763728e1935b'),
  },
  {
    sku: 'MKP-HNB-008',
    name: 'Theragun Prime Percussive Massage Device',
    description:
      'Quiet deep-tissue massage with ergonomic grip and four attachments for large muscle groups and pinpoint areas. Bluetooth app guides routines and intensity.',
    category: 'Health & Beauty',
    tags: ['recovery', 'massage', 'percussion', 'fitness'],
    price: '299.00',
    stock: 71,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-SPO-001',
    name: 'Yeti Rambler 26 oz Straw Bottle (Stainless)',
    description:
      'Double-wall vacuum insulation keeps drinks cold for hours on hikes and commutes. Dishwasher-safe lid and durable kitchen-grade stainless steel body.',
    category: 'Sports & Outdoors',
    tags: ['insulated', 'hiking', 'water-bottle', 'stainless'],
    price: '40.00',
    stock: 189,
    imageUrl: unsplash('1542291026-7eec264c27ff'),
  },
  {
    sku: 'MKP-SPO-002',
    name: 'Black Diamond Spot 400 Headlamp',
    description:
      '400-lumen max output with red night-vision mode and IP67 weather resistance. Simple three-button interface for trail running and camping.',
    category: 'Sports & Outdoors',
    tags: ['headlamp', 'camping', 'trail', 'weatherproof'],
    price: '49.95',
    stock: 142,
    imageUrl: unsplash('1526170375885-4d8ecf77b99f'),
  },
  {
    sku: 'MKP-SPO-003',
    name: 'Hydro Flask Wide Mouth 32 oz Bottle with Flex Cap',
    description:
      'TempShield insulation keeps cold drinks icy and hot drinks warm for hours. Powder coat finish resists slipping and fits most car cup holders with optional boot.',
    category: 'Sports & Outdoors',
    tags: ['hydration', 'insulated', 'gym', 'outdoor'],
    price: '44.95',
    stock: 226,
    imageUrl: unsplash('1542291026-7eec264c27ff'),
  },
  {
    sku: 'MKP-SPO-004',
    name: 'Manduka PRO Yoga Mat (71", Black)',
    description:
      'Dense cushioned support with a closed-cell surface that resists moisture absorption. Lifetime durability makes it a studio favorite for daily practice.',
    category: 'Sports & Outdoors',
    tags: ['yoga', 'mat', 'studio', 'non-slip'],
    price: '130.00',
    stock: 81,
    imageUrl: unsplash('1472851294608-062f824d29cc'),
  },
  {
    sku: 'MKP-SPO-005',
    name: 'Garmin Forerunner 255 Music GPS Running Watch',
    description:
      'Multi-band GPS, training readiness scores, and onboard music storage for phone-free runs. Battery lasts weeks in smartwatch mode with daily tracking.',
    category: 'Sports & Outdoors',
    tags: ['gps', 'running', 'smartwatch', 'training'],
    price: '399.99',
    stock: 59,
    imageUrl: unsplash('1523275335684-37898b6baf30'),
  },
  {
    sku: 'MKP-SPO-006',
    name: 'Coleman Sundome 4-Person Camping Tent',
    description:
      'Easy setup dome tent with welded floors and inverted seams to keep rain out. Large windows and ground vent improve airflow on warm nights.',
    category: 'Sports & Outdoors',
    tags: ['camping', 'tent', 'family', 'weatherproof'],
    price: '119.99',
    stock: 44,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-SPO-007',
    name: 'TRX All-in-One Suspension Training System',
    description:
      'Bodyweight trainer anchors to doors or overhead beams for full-body workouts anywhere. Includes app access with guided programs for strength and mobility.',
    category: 'Sports & Outdoors',
    tags: ['fitness', 'bodyweight', 'home-gym', 'portable'],
    price: '169.95',
    stock: 88,
    imageUrl: unsplash('1505740420928-5e560c06d30e'),
  },
  {
    sku: 'MKP-SPO-008',
    name: 'CamelBak M.U.L.E. 12 Hydration Pack',
    description:
      'Mountain biking pack with a 3-liter reservoir, tool organization, and breathable back panel. Stabilized harness keeps the load secure on rough trails.',
    category: 'Sports & Outdoors',
    tags: ['hydration-pack', 'mtb', 'cycling', 'trail'],
    price: '115.00',
    stock: 62,
    imageUrl: unsplash('1542291026-7eec264c27ff'),
  },
  {
    sku: 'MKP-BKS-001',
    name: 'Moleskine Classic Hard Cover Notebook (Large, Ruled)',
    description:
      'Archival-quality paper with a durable hard cover and elastic closure. Lies flat when open for comfortable writing during meetings and journaling.',
    category: 'Books & Stationery',
    tags: ['notebook', 'journal', 'ruled', 'hardcover'],
    price: '24.95',
    stock: 310,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-BKS-002',
    name: 'Pilot G2 Retractable Gel Pens (12-Pack, Black)',
    description:
      'Smooth gel ink with a comfortable rubber grip for long writing sessions. Refillable design reduces waste and keeps your favorite pen in service.',
    category: 'Books & Stationery',
    tags: ['pens', 'gel-ink', 'office', 'bulk'],
    price: '18.99',
    stock: 445,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-BKS-003',
    name: 'Rhodia Dot Pad No. 16 (6x8.25")',
    description:
      '80 sheets of premium Clairefontaine paper with subtle dot grid for bullet journaling and sketches. Micro-perforated top for clean sheet removal.',
    category: 'Books & Stationery',
    tags: ['notepad', 'dot-grid', 'sketch', 'fountain-pen-friendly'],
    price: '14.50',
    stock: 198,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-BKS-004',
    name: 'Staedtler Mars Plastic Eraser (4-Pack)',
    description:
      'Soft white eraser that removes graphite cleanly with minimal crumbling. Latex-free and ideal for students and drafters who need precise corrections.',
    category: 'Books & Stationery',
    tags: ['eraser', 'drafting', 'school', 'latex-free'],
    price: '6.49',
    stock: 520,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-BKS-005',
    name: 'Lamy Safari Fountain Pen (Fine Nib, Charcoal)',
    description:
      'Ergonomic grip and sturdy ABS body make this a reliable daily writer. Includes converter for bottled ink and a window to monitor ink level.',
    category: 'Books & Stationery',
    tags: ['fountain-pen', 'writing', 'gift', 'fine-nib'],
    price: '37.00',
    stock: 167,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-BKS-006',
    name: 'The Creative Act: A Way of Being (Hardcover) by Rick Rubin',
    description:
      'A thoughtful exploration of creativity as a daily practice rather than a rare gift. Short chapters invite reflection for artists, makers, and curious minds.',
    category: 'Books & Stationery',
    tags: ['nonfiction', 'creativity', 'hardcover', 'bestseller'],
    price: '32.00',
    stock: 134,
    imageUrl: unsplash('1496181133206-80ce9b88a853'),
  },
  {
    sku: 'MKP-BKS-007',
    name: 'Leuchtturm1917 Medium A5 Dotted Notebook (Navy)',
    description:
      'Numbered pages, two ribbon bookmarks, and an expandable back pocket for notes and tickets. Acid-free paper works well with fountain pens and fineliners.',
    category: 'Books & Stationery',
    tags: ['bullet-journal', 'dotted', 'a5', 'archival'],
    price: '24.90',
    stock: 221,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
  {
    sku: 'MKP-BKS-008',
    name: '3M Scotch Magic Tape Dispenser Value Pack',
    description:
      'Matte-finish tape disappears on paper for professional-looking documents. Includes refill rolls and a weighted dispenser for one-handed use.',
    category: 'Books & Stationery',
    tags: ['tape', 'office', 'desk', 'adhesive'],
    price: '12.99',
    stock: 380,
    imageUrl: unsplash('1460925895917-afdab827c52f'),
  },
];
