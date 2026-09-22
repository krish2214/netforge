# NetForge build and manual publishing notes

## Validation completed

The renamed Electron desktop application passed:

- `npm run typecheck`
- `npm run build`
- `npm run test:e2e:smoke`
- `npm run lint`
- `npm run format:check`
- `npm run build:linux`

The Linux packaging build produced x86_64 and ARM64 AppImage and Debian packages in `dist/`.

## Before publishing

1. The repository links are configured for krish2214/netforge; update-check and release URLs now point there.
2. Review the final product name and version in `package.json` and `electron-builder.yml`.
3. Create your own GitHub repository named `netforge`, then push this source tree.
4. Keep the upstream `LICENSE` file. The source is MIT licensed and the original copyright notice must remain in redistributed copies. Your original modifications and branding can be maintained under your own project identity, but the upstream copyright cannot be removed or claimed as exclusively yours.
5. Build platform-specific installers on the appropriate operating systems before publishing a release:

```bash
npm ci
npm run build:mac
npm run build:win
npm run build:linux
```

6. Publish releases manually through GitHub Releases. This project has not been pushed or published by this task.
