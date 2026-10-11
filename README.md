# proton-wallet-electron-aaha

Unofficial Linux Electron wrapper for [Proton Wallet](https://wallet.proton.me), maintained by Adam And His Agents, independent of Proton. Wrapper **2.0.0** uses [template v3.0.0](https://github.com/adamnold/template-electron-aaha/tree/v3.0.0), commit `f76f479eaed13dc769c52fd31ad1273fe6de6f26`.

Pins: Electron **44.7.0**, electron-builder **26.17.0**, @electron/fuses **2.1.3**, build Node **24.21.0** / npm **11.19.0**. Signed `BUILDINFO.json` records bundled Chromium/Node/V8 and actual build tools; [VERSION-INVENTORY.json](VERSION-INVENTORY.json) lists every resolved dependency and runtime component. Proton's remote service updates independently and is not bundled or audited by this wrapper release.

## Install and manual updates

Linux must permit unprivileged user namespaces. Unsupported hosts fail closed; root execution and sandbox-disabling inputs are refused. No privileged sandbox helper is used. Install Minisign and build-time Node. Put the matching release's AppImage, BUILDINFO.json, SHA256SUMS and SHA256SUMS.minisig into a clean `dist/` beside that release's tagged source:

```sh
bash install.sh --public-key /independently/trusted/proton-wallet-electron-aaha.pub
```

Authenticate [release.pub](release.pub) independently: a key downloaded beside an artifact does not itself establish publisher trust. See [SIGNING.md](SIGNING.md). The installer authenticates before extraction, stages and reverifies the AppImage, then extracts that same image. It ignores `dist/linux-unpacked` and removes `chrome-sandbox`.

Default: `~/.local/opt/aaha/proton-wallet-electron-aaha`. Custom absolute roots ending in `/proton-wallet-electron-aaha` are supported with `--install-root`. Direct AppImage execution requires FUSE, or `APPIMAGE_EXTRACT_AND_RUN=1`, and the same namespace sandbox checks.

Updates are manual: verify/install the new release and restart. There is no background updater. Existing users must install this release to receive its changes; old releases/tags remain historical records with their original names.

## Upgrade from proton-wallet-aaha

Close both wrappers before installing. First installation copies `Proton Wallet` to `proton-wallet-electron-aaha` within absolute `$XDG_CONFIG_HOME`, or `~/.config` when unset/relative. The original is retained; an existing new profile takes precedence. Old desktop IDs remain hidden aliases pointing to the new launcher.

Compatibility exception: Electron's internal OS secret-store application name remains `Proton Wallet`, preserving lookup of existing cookie-encryption keys. Public package, executable, window and desktop names use the new name. Copying profiles alone does not prove encrypted sessions will survive every host/backend change; reauthentication may still be necessary. Encrypted signed-in migration is outside the owner-approved signed-out QA scope.

The old application directory, including its privileged helper, is retired only with a validated old receipt and exact old identity marker. Old default/custom roots are supported; linked paths, traversal and mismatches are refused. Without a receipt the installer does not guess or delete old directories. Use the matching old uninstaller without `--purge` for an untracked installation. No sudo is invoked by the new installer.

New and old application roots must be disjoint. Linked legacy profile directories and profiles with a `SingletonLock` are refused before migration; close the old wrapper first, and investigate a stale lock rather than automatically deleting it.

`bash uninstall.sh` preserves profiles. Explicit `--purge` removes only the new local profile after receipt/marker validation. The retained `Proton Wallet` backup is preserved and must be removed separately if desired. Purge does not delete a cloud wallet, account, seed backup or Bitcoin assets.

## Security and acceptance limits

Navigation: only `https://wallet.proton.me`. Authentication: only `https://account.proton.me`. Clipboard writing: wallet origin only. Clipboard reading, notifications, camera, microphone, location and unknown permissions are denied. External HTTPS/mail links open in the system browser; HTTP and custom protocols including `bitcoin:` are denied. On-ramp providers run outside the wrapper.

The wrapper adds no transactions, signing, seeds, private-key handling, native bridge or wallet key management. A compromised remote service could still compromise an active wallet session; renderer isolation does not establish the integrity of Proton's wallet code. Verify transaction details independently and use appropriate custody controls for significant funds.

The owner limited migration QA to signed-out checks. Signed-in authentication, uploads/downloads, actual clipboard flows, notifications and signed-in persistence are **untested**. Never test with real funds, seeds or private keys. See [VALIDATION.md](VALIDATION.md), [DEPENDENCIES.md](DEPENDENCIES.md), [HARDENING.md](HARDENING.md) and [PRIVACY.md](PRIVACY.md).

Development: `bash build.sh` (publication disabled), then `bash install.sh --local-build` only for your own unsigned build. Checks: `npm run check`, `npm test`, `npm audit --audit-level=high`.
