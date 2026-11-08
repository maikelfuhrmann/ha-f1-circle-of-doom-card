# Project branding

Original project artwork created on 8 November 2026 using the built-in Imagegen tool. The source generation is retained locally; the repository contains PNG exports at 512 pixels (`brand/logo.png`, `brand/icon@2x.png`) and 256 pixels (`brand/icon.png`). The mark uses a racing car, circular timing ring, red pit window and diamond rejoin marker. It contains no official Formula 1 or Home Assistant logo.

The README embeds the logo so it is visible on GitHub and on the Home Assistant Marketplace repository detail page. Current Marketplace dashboard entries use the category icon in the list; custom brand icons are only loaded for integrations with a domain. This is a frontend limitation, not a missing `hacs.json` setting. See [renderRepositoryIcon](https://github.com/home-assistant/frontend/blob/dev/src/panels/marketplace/tools/repository-icon.ts) and [the dashboard publishing guide](https://contributors.home-assistant.io/marketplace/guides/dashboard/).

No Home Assistant frontend patches or fake integration metadata are required. These assets can also be reused for project previews. The project artwork is offered under the repository's MIT license.

## Generation prompt

Built-in Imagegen, new image, opaque background:

```text
Use case: logo-brand. Create one polished original app icon for the community project 'Circle of Doom', a motorsport pit-stop strategy dashboard. Square icon, designed to be recognizable at 32px. A bold white circular timing ring on a solid very dark navy #111722 background, with a vivid coral-red #ff453a pit-window arc and one crisp white diamond rejoin marker. Subtle dynamic motorsport character, precise geometry, confident contemporary software branding, flat vector-like finish, generous even padding, centered single symbol. No text, no letters, no numbers, no official Formula 1 logo, no checkered flag, no gradients, no mockup, no border frame, no photorealism. 1024x1024 square composition.
```

PNG exports are resized from the generated image; the design itself is unchanged.
