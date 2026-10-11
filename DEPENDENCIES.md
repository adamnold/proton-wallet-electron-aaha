# Dependency validation — 2026-10-11

Application-specific `npm audit --json`: **0 critical/high/low, 8 moderate affected-package entries**. The high/critical gate passes; the moderate findings are retained explicitly, without audit suppression or a forced downgrade.

Pins: Electron 44.7.0, electron-builder 26.17.0, @electron/fuses 2.1.3; build Node 24.21.0 / npm 11.19.0. The builder also pulls @electron/fuses 1.8.0 internally; our explicit afterPack hook uses 2.1.3. Actual bundled Chromium/Node and tools are recorded in signed BUILDINFO.json.

The eight entries propagate [sprintf-js unbounded precision denial of service](https://github.com/advisories/GHSA-hp3w-g68c-fv3c): electron-builder 26.17.0 → app-builder-lib 26.17.0 → @electron/get 3.1.0 → global-agent 3.0.0 → roarr 2.15.4 → sprintf-js 1.1.3. Affected names: @electron/get, app-builder-lib, dmg-builder, electron-builder, electron-builder-squirrel-windows, global-agent, roarr, sprintf-js. The reported builder downgrade to 26.5.0 is not a validated safe remediation for this release.

These are build/development dependencies; no npm runtime dependency tree is packaged and no renderer Node/IPC bridge is provided. The format-string trigger has not been established from remote wallet content into the build tooling. This narrows exposure; it does not make the tooling immune. Continue tracking upstream patches and audit each release.

The lock also contains electron-builder → app-builder-lib → @electron/get 3.1.0 → got 11.8.6 → cacheable-request 7.0.4 → http-cache-semantics 4.3.0. npm does not flag this installed node. The [shared-cache Set-Cookie advisory](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) remains an upstream unresolved library concern; being outside its database version range alone does not prove remediation. The downloader does not enable got's HTTP cache by default; no shared multi-user application cache is implemented here. The template's synthetic library probe is evidence about that dependency, not a live exploit in this wrapper.

The committed lockfile enumerates every resolved dependency version. Signed build metadata covers its SHA-256. Repeated locked builds are supported; bit-for-bit reproducibility has not been established. Historical audit statements describe their dated runs only.

Local packaging used the builder's legacy AppImage toolset selector 0.0.0 (archive appimage-12.0.1), with mksquashfs 4.3-git dated 2017/07/18. This is build tooling, not the Chromium runtime. BUILDINFO records binary digests so that this old bundled toolchain is visible rather than represented as a contemporary version. Replacement toolsets need separate compatibility/security validation. Electron reports its OpenSSL field as 0.0.0; that placeholder is not a usable upstream TLS-library release version.
