# Contributing

```sh
npm ci
npm run typecheck
npm run lint
npm run test:ci
npm run build
```

- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`, `chore:`); release-please builds the changelog and version bump from them.
- Use the terms in [GLOSSARY.md](./GLOSSARY.md) in code, docs and issues.
- Record hard-to-reverse, surprising decisions as an ADR in `docs/adr/`.
- Run the example app: `cd example && npx expo start`.
- Build the docs site locally: `npm run docs` (output in `site/`).
