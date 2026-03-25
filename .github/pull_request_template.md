## Summary

- What changed?
- Why was it needed?

## Geo Standards Compliance

If this PR touches any geo-related code, compliance with [Geo Standards](../docs/geo-standards.md) is mandatory.

Checklist:
- [ ] Coordinate validation enforced (`lat`, `lng` numeric + range-safe)
- [ ] Radius hard cap enforced (`<= 5 km` for MVP)
- [ ] Geo query uses indexed field (`2dsphere`) and safe operators
- [ ] Response includes `distance_km`
- [ ] Nearby results are sorted nearest-first
- [ ] Pre-commit geo guard passed (`node scripts/check-geo-queries.mjs`)

## Review Guidance

Geo-related changes require explicit reviewer confirmation against [Geo Standards](../docs/geo-standards.md).
