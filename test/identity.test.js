"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path"), vm = require("node:vm");
const { createRequire } = require("node:module");

test("public rename retains the previous OS cookie-encryption identity and uses the new profile", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wallet-identity-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const file = path.resolve(__dirname, "../src/main.js"), load = createRequire(file);
  const cfg = load("../app.config.js");
  let cryptoName, userData;
  const app = {
    setName(value) { cryptoName = value; },
    setPath(name, value) { if (name === "userData") userData = value; },
    enableSandbox() {}, commandLine: { appendSwitch() {} },
    requestSingleInstanceLock() { return false; }, quit() {}
  };
  const proc = { platform: "linux", env: {}, argv: [], getuid: () => 1000 };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), {
    require(name) {
      if (name === "electron") return { app };
      if (name === "./profiles.js") return { profileRoot: () => root };
      return load(name);
    }, process: proc, console
  });
  assert.equal(cryptoName, "Proton Wallet");
  assert.equal(userData, path.join(root, "proton-wallet-electron-aaha"));
  assert.equal(cfg.productName, "proton-wallet-electron-aaha");
});
