#!/usr/bin/env node
/**
 * Bump WorldNote desktop version, commit, tag, and optionally push.
 * CI builds installers when the v* tag is pushed (.github/workflows/release.yml).
 *
 * Usage:
 *   pnpm release 0.1.3           # explicit version
 *   pnpm release patch           # bump patch (0.1.2 → 0.1.3)
 *   pnpm release patch --push      # also git push + tag (triggers CI)
 *   pnpm release 0.1.3 --no-push   # commit + tag locally only
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  tauriConf: join(root, "apps/app-worldnote/src-tauri/tauri.conf.json"),
  packageJson: join(root, "apps/app-worldnote/package.json"),
  cargoToml: join(root, "apps/app-worldnote/src-tauri/Cargo.toml"),
  cargoLock: join(root, "Cargo.lock"),
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function currentVersion() {
  return readJson(paths.tauriConf).version;
}

function resolveVersion(arg) {
  const current = currentVersion();
  if (/^\d+\.\d+\.\d+$/.test(arg)) {
    return arg;
  }
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) {
    throw new Error(`Unexpected current version: ${current}`);
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  switch (arg) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(
        `Invalid version "${arg}". Use patch|minor|major or x.y.z (current: ${current}).`,
      );
  }
}

function setVersion(version) {
  const tauriConf = readJson(paths.tauriConf);
  tauriConf.version = version;
  writeJson(paths.tauriConf, tauriConf);

  const packageJson = readJson(paths.packageJson);
  packageJson.version = version;
  writeJson(paths.packageJson, packageJson);

  const cargoToml = readFileSync(paths.cargoToml, "utf8");
  writeFileSync(
    paths.cargoToml,
    cargoToml.replace(/^version = ".*"$/m, `version = "${version}"`),
    "utf8",
  );

  const cargoLock = readFileSync(paths.cargoLock, "utf8");
  writeFileSync(
    paths.cargoLock,
    cargoLock.replace(
      /(\[\[package\]\]\nname = "app-worldnote"\nversion = ")[^"]+(")/,
      `$1${version}$2`,
    ),
    "utf8",
  );
}

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { cwd: root, stdio: "inherit" });
}

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const versionArg = args.find((arg) => !arg.startsWith("--"));
const push = args.includes("--push");
const noPush = args.includes("--no-push");

if (!versionArg) {
  console.error("Usage: pnpm release <x.y.z|patch|minor|major> [--push]");
  process.exit(1);
}

const version = resolveVersion(versionArg);
const tag = `v${version}`;

if (version === currentVersion()) {
  console.error(`Version is already ${version}. Nothing to do.`);
  process.exit(1);
}

console.log(`Releasing ${tag}...`);
setVersion(version);

run(
  "git add apps/app-worldnote/package.json apps/app-worldnote/src-tauri/Cargo.toml apps/app-worldnote/src-tauri/tauri.conf.json Cargo.lock",
);
run(`git commit -m "Release ${tag}"`);
run(`git tag -a ${tag} -m "WorldNote ${tag}"`);

if (push) {
  run("git push");
  run(`git push origin ${tag}`);
  console.log(`\nDone. CI will build installers for ${tag}.`);
  console.log("https://github.com/Alexandre-Nzinga/worldnote/actions");
} else if (noPush) {
  console.log(`\nCreated commit and tag ${tag} locally (--no-push).`);
} else {
  console.log(`\nCreated commit and tag ${tag} locally.`);
  console.log(`Push to publish: git push && git push origin ${tag}`);
}
