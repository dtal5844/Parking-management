# App Icons

## Quick Setup

The `icon.svg` file contains the app icon design.

## Generate PNG Icons

To generate the required PNG icons from the SVG:

### Option 1: Using Online Tool
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `icon.svg`
3. Download the generated icons
4. Place `icon-192.png` and `icon-512.png` in this directory

### Option 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick first if not installed
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generate icons
magick convert icon.svg -resize 192x192 icon-192.png
magick convert icon.svg -resize 512x512 icon-512.png
```

### Option 3: Using Node.js (if you have sharp installed)
```bash
npm install sharp-cli -g
sharp -i icon.svg -o icon-192.png resize 192 192
sharp -i icon.svg -o icon-512.png resize 512 512
```

## Temporary Fallback

If icons are not generated yet, the app will still work but won't have custom icons when installed.