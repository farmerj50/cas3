# Mobile Assets

Required assets for Capacitor icon and splash screen generation.

## icon.png
- Size: 1024x1024
- Format: PNG, no transparency
- Background: dark blue #020b2d

## splash.png
- Size: 2732x2732
- Format: PNG
- Centered logo on dark blue #020b2d background

## After adding both files, run:

```bash
npx capacitor-assets generate --assetPath assets
npx cap sync
```
