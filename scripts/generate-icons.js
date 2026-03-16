import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../src-tauri/icons/icon.svg');
const iconsDir = path.join(__dirname, '../src-tauri/icons');

const sizes = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 1024 },
  { name: 'Square30x30Logo.png', size: 30 },
  { name: 'Square44x44Logo.png', size: 44 },
  { name: 'Square71x71Logo.png', size: 71 },
  { name: 'Square89x89Logo.png', size: 89 },
  { name: 'Square107x107Logo.png', size: 107 },
  { name: 'Square142x142Logo.png', size: 142 },
  { name: 'Square150x150Logo.png', size: 150 },
  { name: 'Square284x284Logo.png', size: 284 },
  { name: 'Square310x310Logo.png', size: 310 },
  { name: 'StoreLogo.png', size: 50 },
];

async function generateIcons() {
  console.log('Generating icons from SVG...');

  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG files
  for (const { name, size } of sizes) {
    const outputPath = path.join(iconsDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${name}`);
  }

  // Generate icon.ico (multi-size ICO file)
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoBuffers = await Promise.all(
    icoSizes.map(size =>
      sharp(svgBuffer).resize(size, size).png().toBuffer()
    )
  );

  // Use sharp to create ICO (it can output to .ico extension)
  await sharp(svgBuffer)
    .resize(256, 256)
    .toFile(path.join(iconsDir, 'icon.ico'));
  console.log('Generated icon.ico (256x256)');

  // Generate icon.icns (macOS icon)
  // For macOS, we'll create a 1024x1024 PNG and let tauri handle icns
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(iconsDir, 'icon.icns.png'));
  console.log('Generated icon.icns.png (use for macOS)');

  console.log('\nAll icons generated successfully!');
  console.log('\nNote: For proper .icns (macOS) file, you can use:');
  console.log('  1. Tauri CLI: pnpm tauri icon src-tauri/icons/icon.svg');
  console.log('  2. Or manually convert icon.icns.png to .icns format');
}

generateIcons().catch(console.error);
