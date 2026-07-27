const fs = require('fs');

const dataFile = 'data/products.json';
const publicDataFile = 'public/data/products.json';

const currentData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

currentData.forEach(p => {
  if (typeof p.brand === 'string') {
    let brandEn = p.brand;
    let brandAr = brandEn.replace('Inspired by', 'مستوحى من');
    p.brand = { en: brandEn, ar: brandAr };
  }
});

const jsonStr = JSON.stringify(currentData, null, 2);

fs.writeFileSync(dataFile, jsonStr);
fs.writeFileSync(publicDataFile, jsonStr);

console.log('Fixed brand translations in products.json');
