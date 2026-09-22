# NetForge

**NetForge** is a desktop download manager that combines multiple network connections—Wi‑Fi, Ethernet, and tethered phones—to download one file in parallel.

> NetForge is an independent renamed distribution maintained by **Krish2214**. It is based on the MIT-licensed Plexo codebase; the upstream copyright notice is retained in [`LICENSE`](LICENSE).

## Downloads

The first published release currently includes tested Linux builds:

- [Linux x86_64 AppImage](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge-1.0.0-rc.9-x86_64.AppImage)
- [Linux ARM64 AppImage](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge-1.0.0-rc.9-arm64.AppImage)
- [Debian / Ubuntu x86_64 package](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge_1.0.0-rc.9_amd64.deb)
- [Debian / Ubuntu ARM64 package](https://github.com/krish2214/netforge/releases/download/v1.0.0-rc.9/netforge_1.0.0-rc.9_arm64.deb)
- [All releases](https://github.com/krish2214/netforge/releases)

Portable macOS and Windows ZIP builds are included in rc.9; native signed installers still require platform-specific signing.

## Highlights

- Multi-interface, multi-connection downloads
- Work stealing so faster networks handle more chunks
- Resumable downloads with integrity checks
- Automatic retry and stall detection
- Live throughput, progress grid, and per-network attribution
- Network naming and color customization
- Light and dark modes
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

This repository has been validated with:

```bash
npm run typecheck
npm run build
npm run test:e2e:smoke
npm run lint
npm run format:check
npm run build:linux
```

## Building releases

Build on the target operating system so native dependencies and signing behavior are correct:

```bash
npm run build:mac
npm run build:win
npm run build:linux
```

See [`BUILD_NOTES.md`](BUILD_NOTES.md) for manual publishing notes. GitHub Actions workflow files are included in the downloadable source archive; this session's GitHub token did not have permission to upload workflow files automatically.

## License and attribution

NetForge is distributed under the MIT License. The original Plexo copyright and license notice are preserved in [`LICENSE`](LICENSE). NetForge-specific branding, documentation, and modifications are maintained by Krish2214.
