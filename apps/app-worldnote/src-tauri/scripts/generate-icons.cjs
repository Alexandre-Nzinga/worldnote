const path = require('path');
const fs = require('fs');
const iconGen = require('icon-gen');

async function run() {
  try {
    const cwd = process.cwd();
    const srcLogo = path.resolve(cwd, '..', '..', 'packages', 'pkg-ui', 'src', 'brand', 'logo', 'assets', 'logo-icon-white.png');
    const dest = path.resolve(cwd, 'src-tauri', 'icons');

    if (!fs.existsSync(srcLogo)) {
      console.error('Source logo not found:', srcLogo);
      process.exit(1);
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    console.log('Generating icons from', srcLogo, 'into', dest);

    await iconGen(srcLogo, dest, {
      report: true,
      modes: ['ico', 'icns'],
      names: {
        ico: 'icon',
        icns: 'icon'
      }
    });

    console.log('Icons generated. You should now see `icon.ico` and `icon.icns` in', dest);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
