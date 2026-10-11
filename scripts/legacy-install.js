"use strict";
// App-specific retirement of the pre-rename wrapper. Never touches profiles.
const fs = require("node:fs");
const path = require("node:path");
const OLD_REPO = "proton-wallet-aaha";
const OLD_APP_ID = "com.adamandhisagents.protonwallet";
const cfg = require("../app.config.js");

function noLinks(file) {
  let current = path.parse(file).root;
  for (const part of file.slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Linked legacy installation path: ${current}`);
    } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}

function inspect(env = process.env, currentRoot) {
  if (cfg.repoName !== "proton-wallet-electron-aaha" || cfg.appId !== "com.adamandhisagents.proton-wallet-electron-aaha") return null;
  const home = env.AAHA_HOME || env.HOME;
  const state = env.AAHA_STATE_HOME || env.XDG_STATE_HOME || path.join(home, ".local/state");
  if (!path.isAbsolute(home) || !path.isAbsolute(state)) throw new Error("Legacy installation requires absolute home/state paths.");
  const configRoot = require("../src/profiles.js").profileRoot(env);
  if (!fs.existsSync(path.join(configRoot, cfg.profileName))) {
    for (const name of cfg.legacyProfileNames) {
      const profile = path.join(configRoot, name);
      noLinks(profile);
      const lock = path.join(profile, "SingletonLock");
      try {
        fs.lstatSync(lock);
        throw new Error("Close the legacy wrapper before copying its locked profile; inspect stale locks manually.");
      } catch (error) { if (error.code !== "ENOENT") throw error; }
    }
  }
  const receipt = path.join(state, "aaha", OLD_REPO, "install-root");
  noLinks(receipt);
  if (!fs.existsSync(receipt)) return null;
  if (!fs.lstatSync(receipt).isFile()) throw new Error("Invalid legacy installation receipt.");
  const text = fs.readFileSync(receipt, "utf8");
  const root = text.replace(/\n$/, "");
  if (!path.isAbsolute(root) || /[\r\n\0"\\]/u.test(root) || root.split("/").some(p => p === "." || p === "..") || path.basename(root) !== OLD_REPO || root === home) {
    throw new Error("Unsafe legacy installation root.");
  }
  noLinks(root);
  if (currentRoot) {
    const target = path.resolve(currentRoot), legacy = path.resolve(root);
    if (target === legacy || target.startsWith(legacy + path.sep) || legacy.startsWith(target + path.sep)) {
      throw new Error("Legacy and new installation roots must be disjoint.");
    }
  }
  if (fs.existsSync(root)) {
    if (!fs.lstatSync(root).isDirectory()) throw new Error("Legacy installation root is not a directory.");
    const marker = path.join(root, ".aaha-install"); noLinks(marker);
    if (!fs.lstatSync(marker).isFile() || fs.readFileSync(marker, "utf8") !== `AAHA_INSTALL_V1\nrepo=${OLD_REPO}\napp_id=${OLD_APP_ID}\n`) {
      throw new Error("Legacy installation identity is invalid; refusing retirement.");
    }
  }
  return { root, receipt, home };
}

function retire(env = process.env, currentRoot) {
  const old = inspect(env, currentRoot);
  if (!old) return;
  fs.rmSync(old.root, { recursive: true, force: true });
  fs.unlinkSync(old.receipt);
  try { fs.rmdirSync(path.dirname(old.receipt)); } catch (error) { if (error.code !== "ENOTEMPTY") throw error; }
  for (const size of [16, 24, 32, 48, 64, 96, 128, 256, 512]) {
    fs.rmSync(path.join(old.home, `.local/share/icons/hicolor/${size}x${size}/apps/${OLD_REPO}.png`), { force: true });
  }
  console.log(`Retired validated legacy installation: ${old.root}; profiles retained.`);
}

if (require.main === module) {
  try {
    if (process.argv[2] === "--check") inspect(process.env, process.argv[3]);
    else if (process.argv[2] === "--retire") retire(process.env, process.argv[3]);
    else throw new Error("Usage: legacy-install.js --check|--retire");
  } catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
}
module.exports = { inspect, retire };
