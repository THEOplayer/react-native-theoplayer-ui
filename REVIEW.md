# Code Review Guidelines

**Be VERY concise.**

## Checklist

### Changeset

Every PR that changes runtime behavior **must** include a changeset entry in `.changeset/`.

If one is missing, suggest adding a file `.changeset/<short-slug>.md`:

```md
---
'@theoplayer/react-native-ui': patch|minor|major
---

<One-line description of the change. End with a full stop.>
```

Use `patch` for bug fixes, `minor` for new features, `major` for breaking changes.

### API surface

- Public API changes must be exported from the package entry (`src/index.tsx`).
- Avoid breaking existing public types without a major version bump.

### Docs

- Public API needs TSDoc comments — `npm run docs` runs TypeDoc with `--treatWarningsAsErrors`, so undocumented or broken references fail.

### Code quality

- No `eslint-disable` or `@ts-ignore` without justification.
- Prettier is enforced via pre-commit hook (`printWidth: 150`); don't manually override.
- Avoid embedding raw non-ASCII characters in source; they can break in minified/release web bundles.
