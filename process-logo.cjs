const Jimp = require('jimp');
const fs = require('fs');

async function run() {
  const sourcePath = 'C:/Users/acer/.gemini/antigravity-ide/brain/f10d6c82-4187-4ed5-9563-ea2c8259f42c/.tempmediaStorage/media_f10d6c82-4187-4ed5-9563-ea2c8259f42c_1781104042146.png';
  
  if (!fs.existsSync(sourcePath)) {
    console.log('Source image not found:', sourcePath);
    return;
  }

  // 1. Copy full logo
  fs.copyFileSync(sourcePath, 'public/logo.png');
  console.log('Copied logo.png');

  // 2. Load and crop for favicon
  const image = await Jimp.read(sourcePath);
  
  // The image is 1024x512. The "O" with magnifying glass is in the middle.
  // We'll crop a square. Let's do width=320, height=320 centered.
  // x = (1024 - 320) / 2 = 352
  // y = (512 - 320) / 2 = 96
  // But wait, "Maroc" takes up less space than "ffres" perhaps?
  // Let's crop from x=480, y=100, w=280, h=280.
  // Wait, let's look at the text: "Maroc" has 5 letters. "ffres" has 5 letters.
  // So the 'O' is roughly exactly in the middle.
  // Let's crop x=420, y=100, w=320, h=320 to be safe.
  
  const cropped = image.clone().crop(460, 110, 260, 260);
  await cropped.writeAsync('public/favicon.png');
  await cropped.writeAsync('public/logo-icon.png');
  
  console.log('Created favicon.png and logo-icon.png');
}

run().catch(console.error);
