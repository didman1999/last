/**
 * DEFINITIVE FINAL FIX v3
 * Replaces ALL confirmed bad photo IDs with new verified-safe ones
 * 
 * CONFIRMED BAD (just verified via browser):
 *   photo-1588405748880 = white skyscraper building
 *   photo-1592945403244 = hand wearing luxury watch
 *   photo-1512207736890 = white architectural building (museum)
 *   photo-1461696114087 = wooden pier/dock over water
 * 
 * PREVIOUSLY CONFIRMED BAD:
 *   photo-1590736969955 = building
 *   photo-1563170351    = wrist with red nails
 *   photo-1587515159029 = wrist watch with hands
 *   photo-1595535373300 = unknown suspect
 *   photo-1616782352822 = unknown suspect
 */

const fs = require('fs');
const path = require('path');

// ALL confirmed bad IDs
const ALL_BAD = [
  'photo-1588405748880',  // CONFIRMED: white skyscraper
  'photo-1592945403244',  // CONFIRMED: hand with luxury watch
  'photo-1512207736890',  // CONFIRMED: architectural building
  'photo-1461696114087',  // CONFIRMED: wooden pier/dock
  'photo-1590736969955',  // CONFIRMED: building
  'photo-1563170351',     // CONFIRMED: wrist with red nails
  'photo-1587515159029',  // CONFIRMED: wrist watch with hands
  'photo-1595535373300',  // SUSPECT
  'photo-1616782352822',  // SUSPECT
  'photo-1526045612212',  // CONFIRMED: hand/appliance
  'photo-1523275335684',  // CONFIRMED: wrist watch
  'photo-1612817288484',  // CONFIRMED: building
];

// VERIFIED SAFE perfume IDs (confirmed: only bottles, no people/hands/buildings)
// - photo-1541643600914 = Coco Noir black bottle on pink bg ✅
// - photo-1571781926291 = amber/golden perfume bottle ✅
// - photo-1523293115678 = perfume bottle blueish ✅
// - photo-1608248543803 = dark perfume bottles on shelf ✅
// - photo-1583241475880 = perfume bottle white bg ✅
// - photo-1549298916-b41d501d3772 = perfume bottle on marble ✅
// - photo-1619994121345 = glass perfume bottle pink ✅
// - photo-1629198725890 = perfume spray mist ✅
// - photo-1615486171448 = perfume bottle with flowers ✅
// - photo-1594035910387 = amber glass perfume ✅
// - photo-1592945403244 = BAD (watch)
// - photo-1595425970377 = cylindrical perfume bottle white label ✅
const SAFE_PERFUMES = [
  'photo-1541643600914-78b084683601',
  'photo-1571781926291-07ddc5f8e49a',
  'photo-1523293115678-d29062e62260',
  'photo-1608248543803-ba4f8c70ae0b',
  'photo-1583241475880-083f84372725',
  'photo-1549298916-b41d501d3772',
  'photo-1619994121345-b61cd610c5a6',
  'photo-1629198725890-e59ab73d8a7c',
  'photo-1615486171448-2b6fd37e0b64',
  'photo-1594035910387-fea47794261f',
  'photo-1595425970377-c9703bc48b2d',
];

// VERIFIED SAFE bag IDs
const SAFE_BAGS = [
  'photo-1548036328-c9fa89d128fa',
  'photo-1584917865442-de89df76afd3',
  'photo-1575032617751-6ddec2089882',
  'photo-1553062407-98eeb64c6a62',
  'photo-1566150905458-1bf1fc113f0d',
  'photo-1547949003-9792a18a2601',
  'photo-1607522370275-f14206abe5d3',
  'photo-1590874103328-eac38a683ce7',
];

function buildUrl(photoId, w = 800) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=${w}&cb=3`;
}

function isBad(url) {
  if (!url) return false;
  return ALL_BAD.some(bad => url.includes(bad));
}

const dataPath = path.join(__dirname, 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let replaced = 0;

data.forEach((product, idx) => {
  // Use safe perfume for most, safe bag occasionally  
  const allPool = [...SAFE_PERFUMES, ...SAFE_PERFUMES, ...SAFE_BAGS]; // 2:1 ratio perfumes:bags
  
  // Fix main image
  if (isBad(product.image)) {
    product.image = buildUrl(allPool[idx % allPool.length]);
    replaced++;
  }

  // Fix gallery images
  if (Array.isArray(product.images)) {
    product.images = product.images.map((imgUrl, j) => {
      if (isBad(imgUrl)) {
        replaced++;
        return buildUrl(SAFE_PERFUMES[(idx * 3 + j + 5) % SAFE_PERFUMES.length]);
      }
      // Also add cache-buster if missing
      if (imgUrl && !imgUrl.includes('&cb=')) {
        return imgUrl + '&cb=3';
      }
      return imgUrl;
    });
  }
  
  // Also add cache-buster to main if not bad but missing cache buster
  if (!isBad(product.image) && product.image && !product.image.includes('&cb=')) {
    product.image = product.image + '&cb=3';
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Fixed ${replaced} bad image URLs in products.json`);

// Verify: show all main image IDs now in use
const finalBadCheck = [];
data.forEach((p, i) => {
  if (isBad(p.image)) finalBadCheck.push(`Product ${i} (${p.name.en}): ${p.image.substring(0,60)}`);
});
if (finalBadCheck.length) {
  console.log('⚠️  Still bad:', finalBadCheck);
} else {
  console.log('✅ Zero bad main images remaining!');
}
