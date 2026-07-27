const fs = require('fs');

const dataPath = 'd:/store prefium/data/products.json';
let products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Curated list of high-quality perfume images from Unsplash
const curatedImages = [
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1595425970377-c9703bc48b2d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1523293115678-d29062e62260?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1615486171448-4fd1eb8a5d3b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1629198725890-e59ab73d8a7c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1563170351-be82bc88ea6d?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1594913785160-590bd75e0e01?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1605333501254-b5b630bf164c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1616782352822-262142277d13?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1595535373300-8b43825700fc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1583241475880-083f84372725?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1608248593842-89587422f5f1?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1592945403405-b0401826bba9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1519962551779-514d1566f1fc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1587515159029-792576b4b47e?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1528659100414-b46eb24fb8ef?auto=format&fit=crop&q=80&w=800"
];

const getUniqueRandomImages = (count) => {
  const images = [];
  while (images.length < count) {
    const randomImg = curatedImages[Math.floor(Math.random() * curatedImages.length)];
    if (!images.includes(randomImg)) {
      images.push(randomImg);
    }
  }
  return images;
};

products = products.map((product, index) => {
  const primaryImg = curatedImages[index % curatedImages.length];
  const gallery = [primaryImg, ...getUniqueRandomImages(2)];
  
  product.image = primaryImg;
  product.images = gallery;
  
  return product;
});

fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), 'utf8');
console.log('Successfully updated images for all 55 products!');
