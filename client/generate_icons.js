const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\fefc7544-7746-4e98-a471-a6680616dbb2\\highway_app_logo_1786815792258.jpg';
const assetsDir = path.join(__dirname, 'assets');

async function generateIcons() {
  try {
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Generate main icon.png (1024x1024)
    await sharp(inputPath)
      .resize(1024, 1024, { fit: 'cover' })
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('Generated icon.png');

    // Generate splash.png (1284x2778)
    // We'll put the logo in the center over a white background
    await sharp({
      create: {
        width: 1284,
        height: 2778,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{
        input: await sharp(inputPath).resize(800, 800, { fit: 'contain' }).toBuffer(),
        gravity: 'center'
      }])
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('Generated splash.png');

    // Generate adaptive-icon (1024x1024)
    await sharp(inputPath)
      .resize(1024, 1024, { fit: 'cover' })
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('Generated adaptive-icon.png');

    // Generate push notification icon (96x96, white/transparent)
    await sharp(inputPath)
      .resize(96, 96, { fit: 'cover' })
      .greyscale()
      .threshold(128)
      .negate() 
      .toColourspace('b-w')
      .toFile(path.join(assetsDir, 'notification-icon.png'));
    console.log('Generated notification-icon.png');

  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
