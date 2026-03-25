# Onboarding

## Geo Rules You Must Follow

Before touching nearby search, location filtering, or geo APIs, read:
- [Geo Standards](./geo-standards.md)

This is the single source of truth for:
- coordinate validation
- distance units and conversion
- mandatory radius limits
- response contract (`distance_km`, nearest-first)

## Enable Local Pre-Commit Geo Guard

Run this once at repo root:

```bash
git config core.hooksPath .githooks
```

Then test manually:

```bash
node scripts/check-geo-queries.mjs
```

If a commit is blocked, fix violations according to [Geo Standards](./geo-standards.md).
