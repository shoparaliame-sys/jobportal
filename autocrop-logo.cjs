const Jimp = require('jimp');
const fs = require('fs');

async function run() {
  const sourcePath = 'C:/Users/acer/.gemini/antigravity-ide/brain/f10d6c82-4187-4ed5-9563-ea2c8259f42c/media__1781186195823.png';
  
  if (!fs.existsSync(sourcePath)) {
    console.log('Source image not found:', sourcePath);
    return;
  }

  console.log('Loading image...');
  const image = await Jimp.read(sourcePath);
  
  console.log('Autocropping...');
  // Jimp's autocrop removes surrounding background/transparent pixels
  image.autocrop();
  
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`New dimensions after autocrop: ${width}x${height}`);
  
  await image.writeAsync('public/maroc-offres-logo.png');
  await image.writeAsync('public/logo.png');
  console.log('Saved autocropped images to public/');
}

run().catch(console.error);
