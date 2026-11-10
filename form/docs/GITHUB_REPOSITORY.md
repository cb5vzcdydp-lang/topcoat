# Form source on GitHub

This folder contains the 548 tracked files from Form commit `e5fc4d7b566b2192ad2d8f199b96873df570ce8b`. It includes the web application and Expo iPhone shell. The surrounding repository is a Topcoat fork; its existing Rust files have been preserved.

## Web development

Run commands inside `form/`, not the repository root. Use Node >=22.13.0 and the package manager pinned by `package.json` (`pnpm@11.25.0`).

```sh
cd form
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm dev
```

The Linux hosting environment also provides `npm run install:ci`, which manages the project-owned installation profile. Database-backed features require the existing Cloudflare D1/R2 bindings and local development configuration; see the project README and Wrangler configuration. No user database or production secrets are included. Do not point an unrelated empty deployment at the production app or assume a checkout contains account history.

## iPhone development

```sh
cd form/mobile
npm ci
npm run check
npm run prebuild:ios
```

On a Mac with Xcode and an Apple signing team, follow [IOS_APP.md](IOS_APP.md) to install native dependencies, build and run. Generated Xcode projects, Pods and signing files are deliberately excluded. This is an Expo/React Native shell around the existing hosted Form application, with native account pairing, file sharing and optional health integration. It is not a signed IPA; device permissions and Apple distribution still require platform testing.

## Hosting and private configuration

The live app remains at https://form-coaching-training.declanleonard8.chatgpt.site. This repository does not establish automatic GitHub deployments, migrate hosting, rotate keys or change account data. Production AI credentials remain in the existing server environment and must never be committed. Existing food source attribution is retained in [FOOD_CATALOGUE.md](FOOD_CATALOGUE.md) and related catalogue documentation.

Only tracked source files were transferred. Dependencies, local databases, private account uploads, runtime caches, signing material and the separately cloned reference repositories were excluded. Source files were checked byte-for-byte against the original checkout before publication.
