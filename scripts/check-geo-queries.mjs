#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SAFE_GEO_OPERATORS = ['\\$geoWithin', '\\$centerSphere', '\\$near', '\\$nearSphere', '\\$geoNear'];
const GEO_OPERATOR_REGEX = new RegExp(SAFE_GEO_OPERATORS.join('|'));
const TARGET_DIR_REGEX = /^(server\/|backend\/|services\/|controllers\/)/i;
const CODE_FILE_REGEX = /\.(js|mjs|cjs|ts|tsx)$/i;

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => TARGET_DIR_REGEX.test(file))
    .filter((file) => CODE_FILE_REGEX.test(file));
}

function readContent(file) {
  const absolute = path.resolve(process.cwd(), file);
  return fs.readFileSync(absolute, 'utf8');
}

function hasGeoIntent(content, filePath) {
  return (
    GEO_OPERATOR_REGEX.test(content) ||
    /geo|nearby|location|latitude|longitude|distance/i.test(content) ||
    /store.*near/i.test(filePath)
  );
}

function checkViolations(filePath, content) {
  const violations = [];

  if (!hasGeoIntent(content, filePath)) {
    return violations;
  }

  const hasGeoWithin = /\$geoWithin/.test(content);
  const hasCenterSphere = /\$centerSphere/.test(content);
  const hasNear = /\$near(?![A-Za-z])|\$nearSphere/.test(content);
  const hasGeoNear = /\$geoNear/.test(content);
  const hasRadiusLimit = /\$maxDistance|radius_km|radiusKm|maxRadiusKm|5000|distance_km/i.test(content);

  const directLatLngComparison =
    /(lat|latitude|lng|lon|longitude)\s*(>=|<=|>|<)\s*-?\d+(\.\d+)?/i.test(content) ||
    /(lat|latitude|lng|lon|longitude)\s*(>=|<=|>|<)\s*[A-Za-z_][A-Za-z0-9_]*/i.test(content);

  if (directLatLngComparison) {
    violations.push('Direct lat/lng comparison detected; use geo operators on indexed fields.');
  }

  if (hasGeoWithin && !hasCenterSphere) {
    violations.push('$geoWithin used without $centerSphere.');
  }

  if ((hasNear || hasGeoNear || hasGeoWithin) && !hasRadiusLimit) {
    violations.push('Geo query appears to be missing an explicit distance/radius limit.');
  }

  const hasIndexedFieldHint =
    /2dsphere|createIndex\(|location|coordinates|geo_location|geoLocation|GEO_INDEXED_FIELD/i.test(content);

  if ((hasNear || hasGeoNear || hasGeoWithin) && !hasIndexedFieldHint) {
    violations.push('Geo query detected without indexed-field hint (location/coordinates/2dsphere).');
  }

  return violations;
}

function main() {
  let staged = [];

  try {
    staged = getStagedFiles();
  } catch (error) {
    console.error('Failed to inspect staged files for geo checks.');
    console.error(String(error?.message || error));
    process.exit(1);
  }

  if (staged.length === 0) {
    process.exit(0);
  }

  const allViolations = [];

  for (const filePath of staged) {
    let content = '';

    try {
      content = readContent(filePath);
    } catch {
      continue;
    }

    const violations = checkViolations(filePath, content);
    if (violations.length > 0) {
      allViolations.push({ filePath, violations });
    }
  }

  if (allViolations.length > 0) {
    console.error('\nGeo query violation detected:\n');
    for (const item of allViolations) {
      console.error(`- ${item.filePath}`);
      for (const violation of item.violations) {
        console.error(`  - ${violation}`);
      }
    }

    console.error('\nFix:');
    console.error('- Use geo-indexed field queries (2dsphere).');
    console.error('- Enforce 5 km radius cap for MVP.');
    console.error('- Return distance_km and nearest-first ordering.');
    console.error('- Follow docs/geo-standards.md.\n');

    process.exit(1);
  }

  process.exit(0);
}

main();
