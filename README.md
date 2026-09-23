# NetForge

**NetForge** is a focused desktop download workbench that combines multiple network connections—Wi‑Fi, Ethernet, and tethered phones—to download one file in parallel.

> NetForge is an independent renamed distribution maintained by **Krish2214**. It is based on the MIT-licensed Plexo codebase; the upstream copyright notice is retained in [`LICENSE`](LICENSE).

## Live website

**Production site:** [https://krish2214.github.io/netforge/](https://krish2214.github.io/netforge/)

The website is published from `main/docs` with GitHub Pages. It includes the release shelf, platform filtering and search, direct artifact links, copyable URLs, a system walkthrough, theme persistence, and a clickable application screenshot gallery.

## Downloads

The public [v1.0.0-rc.9 release](https://github.com/krish2214/netforge/releases/tag/v1.0.0-rc.9) includes:

- [Windows x64 portable ZIP](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/NetForge-1.0.0-rc.9-win.zip)
- [Windows ARM64 portable ZIP](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/NetForge-1.0.0-rc.9-arm64-win.zip)
- [macOS Intel portable ZIP](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/NetForge-1.0.0-rc.9-mac.zip)
- [macOS Apple Silicon portable ZIP](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/NetForge-1.0.0-rc.9-arm64-mac.zip)
- [Linux x86_64 AppImage](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge-1.0.0-rc.9-x86_64.AppImage)
- [Linux ARM64 AppImage](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge-1.0.0-rc.9-arm64.AppImage)
- [Debian / Ubuntu x86_64 package](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge_1.0.0-rc.9_amd64.deb)
- [Debian / Ubuntu ARM64 package](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge_1.0.0-rc.9_arm64.deb)

The Windows and macOS artifacts are portable unsigned ZIP releases. Native signed installers require signing on the respective operating systems.

## Highlights

- Multi-interface, multi-connection downloads
- Work stealing so faster networks handle more chunks
- Resumable downloads with integrity checks
- Automatic retry and stall detection
- Live throughput, progress grid, and per-network attribution
- Network naming and color customization
- Native desktop notifications

## Development

Requirements: Node.js 22.12+ and npm 9+.

```bash
git clone https://github.com/krish2214/netforge.git
cd netforge
npm ci
npm run dev
```

## Validation

```bash
npm run typecheck
npm run build
npm run test:e2e:smoke
npm run lint
npm run format:check
npm run build:linux
```

## GitHub Pages deployment

The production site is a static `docs/index.html` page. To configure it manually, open **Repository → Settings → Pages**, choose **Deploy from a branch**, select `main`, and choose `/docs`. GitHub will publish to `https://krish2214.github.io/netforge/`.

To make the site visible in the GitHub repository header, set the repository **About → Website** field to the same production URL. This repository has that homepage metadata configured already.

## License and attribution

NetForge is distributed under the MIT License. The original Plexo copyright and license notice are preserved in [`LICENSE`](LICENSE). NetForge-specific branding, documentation, and modifications are maintained by Krish2214.
