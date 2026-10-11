# Privacy and network behavior

No AAHA analytics are added. Optional Chromium background networking, component updates, domain reporting, translation, optimization, media routing and Secure DNS are disabled. The inherited Google update/telemetry blocklist is a privacy mitigation, not an egress allowlist or guarantee of anonymity.

Proton Wallet and account authentication, Bitcoin infrastructure, exchange rates, email and explicitly selected purchase/on-ramp providers may require traffic. Top-level navigation restrictions do not cover every remote service request. Proton's JavaScript, service workers and releases update independently of the signed wrapper. A compromised service retains web access to the active session.

Profiles use absolute `$XDG_CONFIG_HOME/proton-wallet-electron-aaha` or `$HOME/.config/proton-wallet-electron-aaha`. Migration retains `Proton Wallet` in the same root. Profiles/backups may contain sensitive sessions and encrypted web data; directory permissions and browser encryption do not replace host security. Do not publish or share them.

Normal uninstall preserves profiles. `--purge` removes only the new local profile, retaining the old backup. This does not remove a cloud wallet, Proton account, seed backup or blockchain assets.

Notifications are denied pending service-specific validation. If later enabled, they would require the wrapper to remain running; there is no background daemon. Updates are manual with no updater traffic. Opt-in `AAHA_NETWORK_AUDIT=1` logs each contacted hostname once, without URLs, bodies or credentials; these logs may still reveal service usage.
