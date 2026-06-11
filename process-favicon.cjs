const Jimp = require('jimp');
const fs = require('fs');

async function run() {
  const sourcePath = 'C:/Users/acer/.gemini/antigravity-ide/brain/f10d6c82-4187-4ed5-9563-ea2c8259f42c/media__1781186568467.png';
  
  if (!fs.existsSync(sourcePath)) {
    console.log('Source image not found:', sourcePath);
    return;
  }

  console.log('Loading image...');
  const image = await Jimp.read(sourcePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  console.log(`Original dimensions: ${width}x${height}`);

  // 1. Crop the top portion of the image containing "M" and the magnifying glass.
  // The bottom text starts below the middle. Let's crop from y=0 to y = height * 0.5
  console.log('Cropping top half emblem...');
  const topHalf = image.clone().crop(0, 0, width, Math.floor(height * 0.5));

  // 2. Autocrop transparent/white borders around the emblem
  console.log('Autocropping emblem...');
  topHalf.autocrop();

  const croppedW = topHalf.bitmap.width;
  const croppedH = topHalf.bitmap.height;
  console.log(`Dimensions after autocrop: ${croppedW}x${croppedH}`);

  // 3. Make it a perfect square by placing it in the center of a square canvas
  const size = Math.max(croppedW, croppedH);
  console.log(`Creating square canvas of size ${size}x${size}...`);
  
  // Create a transparent background image
  const squareImage = await new Promise((resolve, reject) => {
    new Jimp(size, size, 0x00000000, (err, img) => {
      if (err) reject(err);
      else resolve(img);
    });
  });

  // Calculate centered position
  const x = Math.floor((size - croppedW) / 2);
  const y = Math.floor((size - croppedH) / 2);

  // Composite the cropped emblem in the center of the transparent canvas
  squareImage.composite(topHalf, x, y);

  // 4. Resize to a high quality standard size for favicon (256x256)
  console.log('Resizing to 256x256...');
  squareImage.resize(256, 256);

  // 5. Write to public/favicon.png and public/logo-icon.png
  await squareImage.writeAsync('public/favicon.png');
  await squareImage.writeAsync('public/logo-icon.png');
  console.log('Saved favicon.png and logo-icon.png to public/ directory!');
}

run().catch(console.error);
