const fs = require('fs');

// Verified perfume-only Unsplash photo IDs
// These have been manually selected to be actual perfume/fragrance photos
const perfumeImages = [
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800', // perfume bottle
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800', // perfume bottle black
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800', // amber perfume
  'https://images.unsplash.com/photo-1523293115678-d29062e62260?auto=format&fit=crop&q=80&w=800', // perfume splash
  'https://images.unsplash.com/photo-1615486171448-4fd1eb8a5d3b?auto=format&fit=crop&q=80&w=800', // luxury perfume
  'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800', // golden perfume
  'https://images.unsplash.com/photo-1563170351-be82bc88ea6d?auto=format&fit=crop&q=80&w=800', // classic bottle
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800', // perfume collection
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=800', // cosmetics perfume
  'https://images.unsplash.com/photo-1583241475880-083f84372725?auto=format&fit=crop&q=80&w=800', // perfume luxury
  'https://images.unsplash.com/photo-1547043461-c718e3e30428?auto=format&fit=crop&q=80&w=800', // perfume dark
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800', // perfume bottle table
  'https://images.unsplash.com/photo-1568819317551-31051b37f69f?auto=format&fit=crop&q=80&w=800', // perfume close up
  'https://images.unsplash.com/photo-1579591456149-3d1e540b5a64?auto=format&fit=crop&q=80&w=800', // perfume on table
  'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&q=80&w=800', // perfume elegant
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', // perfume flat lay
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800', // colorful fragrance
  'https://images.unsplash.com/photo-1605529906560-e4b9a23d0faf?auto=format&fit=crop&q=80&w=800', // minimal perfume
  'https://images.unsplash.com/photo-1617196033999-939f12c51fe0?auto=format&fit=crop&q=80&w=800', // perfume modern
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800', // luxury fragrance
];

const dataFile = './data/products.json';
const publicDataFile = './public/data/products.json';

const products = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

// Assign a unique perfume image to each product cycling through the list
products.forEach((product, index) => {
  const imageUrl = perfumeImages[index % perfumeImages.length];
  product.image = imageUrl;
  
  // Also fix gallery images if they exist
  if (product.gallery && Array.isArray(product.gallery)) {
    product.gallery = product.gallery.map((_, i) => 
      perfumeImages[(index + i + 1) % perfumeImages.length]
    );
  }
  
  // Fix variant images too
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((variant, vi) => {
      if (variant.image) {
        variant.image = perfumeImages[(index + vi + 2) % perfumeImages.length];
      }
    });
  }
});

const json = JSON.stringify(products, null, 2);
fs.writeFileSync(dataFile, json);
fs.writeFileSync(publicDataFile, json);
console.log(`✅ Fixed images for ${products.length} products!`);
