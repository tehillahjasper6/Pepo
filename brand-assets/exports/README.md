# PNG Exports

This directory contains pre-rendered PNG icons for app stores and platforms.

## Required Files

- `icon-1024.png` - 1024x1024px - App Store, Play Store
- `icon-512.png` - 512x512px - Web favicons, PWA
- `icon-256.png` - 256x256px - Desktop icons

## Generating PNGs from SVG

### Using ImageMagick

```bash
# Install ImageMagick
brew install imagemagick  # macOS
# or
apt-get install imagemagick  # Linux

# Generate PNGs from SVG
cd /Users/visionalventure/Pepo/brand-assets

# 1024x1024
convert -background none -resize 1024x1024 logos/pepo-bee-mascot.svg exports/icon-1024.png

# 512x512
convert -background none -resize 512x512 logos/pepo-bee-mascot.svg exports/icon-512.png

# 256x256
convert -background none -resize 256x256 logos/pepo-bee-mascot.svg exports/icon-256.png
```

### Using Inkscape

```bash
# Install Inkscape
brew install inkscape  # macOS

# Generate PNGs
inkscape logos/pepo-bee-mascot.svg --export-filename=exports/icon-1024.png --export-width=1024 --export-height=1024
inkscape logos/pepo-bee-mascot.svg --export-filename=exports/icon-512.png --export-width=512 --export-height=512
inkscape logos/pepo-bee-mascot.svg --export-filename=exports/icon-256.png --export-width=256 --export-height=256
```

### Using Online Tools

1. Open `logos/pepo-bee-mascot.svg` in a browser
2. Use browser dev tools to export as PNG at different sizes
3. Or use tools like:
   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - [Convertio](https://convertio.co/svg-png/)

## Design Guidelines

- **Background**: Transparent
- **Padding**: 10% margin around the bee (for app store requirements)
- **Colors**: Maintain Honey Gold (#F4B400) and Bee Black (#1E1E1E)
- **Format**: PNG-24 with transparency

## Status

⚠️ **Pending**: PNG files need to be generated from `logos/pepo-bee-mascot.svg`

## Usage

Once generated, these can be used in:

- **Web App**: `apps/web/app/icon.png` (512x512)
- **Mobile App**: `apps/mobile/app.json` icon field
- **App Stores**: iOS App Store and Google Play Store submissions



