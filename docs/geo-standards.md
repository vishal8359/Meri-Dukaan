# Geo Standards (Single Source of Truth)

This document is the mandatory source of truth for all geo-related modules in SangamApp.

## Scope

Applies to all geo logic in:

- `server/src/**`
- `client/src/**`
- any new backend services/controllers/modules that implement nearby search

## A) Coordinate Validation (MANDATORY)

All incoming coordinates must be validated before any query.

Rules:

- Latitude range: `-90` to `90`
- Longitude range: `-180` to `180`
- Reject `null` or `undefined`
- Reject strings and non-numeric values
- Reject swapped latitude/longitude values
- Always parse to number before query construction

Validation checklist:

- Use numeric parsing (`Number(...)`) and finite checks
- Reject if `!Number.isFinite(lat)` or `!Number.isFinite(lng)`
- Reject if ranges are violated
- Reject if values look swapped (for example `|lat| > 90` and `|lng| <= 90`)

## B) Distance Standard (MANDATORY)

Canonical internal distance unit is kilometers.

Rules:

- Internal contract and business logic use `distance_km`
- If query requires radians, convert with:
  - `distance_km / 6378.1`
- API responses must return `distance_km`
- Do not expose miles as primary output
- Do not expose meters as primary output

## C) Query Rules

Rules:

- Geo queries are allowed only on geo-indexed fields (Mongo `2dsphere`)
- Every nearby query must include a radius limit
- Unbounded geo queries are forbidden
- MVP hard cap is `5 km`
- Direct lat/lng comparison filtering is forbidden

Forbidden examples:

- latitude/longitude bounding conditions (`lat > x && lat < y`)
- `$geoWithin` without `$centerSphere`
- `$near` / `$nearSphere` without explicit max distance

## D) Response Contract

Every nearby API must:

- return `distance_km`
- sort by nearest first (ascending distance)

Recommended shape:

```json
[
  {
    "store": { "id": "...", "name": "..." },
    "distance_km": 1.42,
    "products": [],
    "services": []
  }
]
```

## Code Review Enforcement

PRs touching geo logic must pass all checks:

- [ ] Coordinate validation conforms to this document
- [ ] Radius hard cap is enforced (`<= 5 km` for MVP)
- [ ] Query uses geo operator over indexed field
- [ ] Response includes `distance_km` sorted nearest-first
- [ ] Geo pre-commit check passes

## Operational Notes

If a geo change must intentionally break a rule, it requires:

- explicit rationale in PR
- dedicated reviewer approval
- update to this document in the same PR
