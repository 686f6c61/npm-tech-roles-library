# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-02-19

### Changed
- Updated package `homepage` metadata to `https://npm-tech-catalog.onrender.com/` so npmjs points to the live demo.
- Documentation adjusted to reference version `1.1.1` and the current homepage/demo URL.

## [1.1.0] - 2026-02-19

### Added
- GitHub Actions CI workflow to validate lint and tests on Node 18, 20 and 22.
- GitHub Actions publish workflow to automatically publish to npm when a GitHub Release is published.
- Per-call override options in `getCompetencies(roleName, level, options)`.
- `lint:check` script for non-mutating CI lint validation.

### Changed
- `filterByLevel` now accepts both numeric (`6`) and string (`"L6"`) level formats.
- `getStatistics()` now includes `byCategory`, matching documentation.
- README updated for release automation, test coverage count, and API behavior.

### Fixed
- Path traversal vulnerability in `demo/server.js` static file serving logic.
- Input validation consistency for role names, search queries, and level normalization.
- Removed legacy unused CSV parser module from published package.
- Stabilized pre-publication tests by removing random sampling and relaxing strict timing assertion.
