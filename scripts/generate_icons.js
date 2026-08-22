const fs = require('fs');
const path = require('path');

async function generate() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Sharp not yet available, will retry after install');
    return;
  }

  const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PWA icons from SVG...');
  for (const size of sizes) {
    const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`  [+] Generated icon-${size}x${size}.png`);
  }
  console.log('All icons generated successfully!');
}

generate().catch(console.error);
