# @sparring/tech-roles-library

[![npm version](https://img.shields.io/npm/v/@sparring/tech-roles-library.svg)](https://www.npmjs.com/package/@sparring/tech-roles-library)
[![CI](https://github.com/686f6c61/npm-tech-roles-library/actions/workflows/ci.yml/badge.svg)](https://github.com/686f6c61/npm-tech-roles-library/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive library of 78 technical roles with 9 career levels each, including detailed competencies, career progression paths, and role comparisons with full bilingual support (EN/ES).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quality Assurance](#quality-assurance)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Initialization](#initialization)
  - [Core Methods](#core-methods)
  - [Search and Filter](#search-and-filter)
  - [Career Path Analysis](#career-path-analysis)
  - [Metadata and Statistics](#metadata-and-statistics)
- [Usage Examples](#usage-examples)
- [Role Categories](#role-categories)
- [Career Levels](#career-levels)
- [Data Structure](#data-structure)
- [Bilingual Support](#bilingual-support)
- [Release and Publishing](#release-and-publishing)
- [Links](#links)
- [Contributing](#contributing)
- [License](#license)

## Overview

@sparring/tech-roles-library is a curated, structured library of 78 technical roles organized into 7 distinct categories with 9 career levels each. It provides a robust API for career path planning and competency analysis with complete bilingual support (English/Spanish).

![Tech Roles Library - Interactive Demo](https://raw.githubusercontent.com/686f6c61/npm-tech-roles-library/main/assets/01%20npm-tech-role-library.png)

### Why this package?

- **Comprehensive**: 78 technical roles × 9 career levels = 702 unique role definitions
- **Structured**: Consistent data format with rich metadata and competencies
- **Bilingual**: Complete Spanish/English support with lazy-loaded translations
- **Career-focused**: Complete progression paths with accumulated competencies
- **Search**: Find roles by name or category
- **Zero dependencies**: No external runtime dependencies
- **Production ready**: Fully tested with 101 passing tests and comprehensive validation

## Features

- **Core functionality**: Access 702 role definitions, filter by category/level, search by name
- **Career paths**: View complete progression (mastered + current + growth)
- **Competency analysis**: Core competencies, complementary skills, and level indicators
- **Search**: Find roles by name or category with customizable result limits
- **Metadata rich**: Years experience, level names, category information
- **Bilingual**: Complete Spanish and English support with automatic translation
- **Statistics**: Catalog analytics and insights
- **Fully tested**: 101 tests with 100% pass rate including comprehensive pre-publication validation

## Quality Assurance

This library has undergone comprehensive validation before publication:

### Test Coverage

- **Total tests**: 101 tests with 100% pass rate
- **Unit tests**: Complete coverage of core functionality, database operations, and translation system
- **Integration tests**: Full validation of translation files, API methods, and data integrity
- **Pre-publication validation**: Extensive testing including:
  - Random JSON integrity checks (20+ file samples)
  - Bidirectional translation validation (50+ file samples)
  - Zero language contamination (0% EN words in ES files, 0% ES words in EN files)
  - Complete category and structure validation
  - All NPM features tested with random samples
  - Performance and lazy loading validation

### Data Quality

- **702 role definitions**: All entries validated for completeness and consistency
- **156 translation files**: 78 EN + 78 ES files, all validated
- **0% translation errors**: Professional technical terminology in both languages
- **Neutral Spanish**: No regionalisms, suitable for all Spanish-speaking markets
- **Consistent structure**: All roles follow the same 9-level framework

### Continuous Validation

Every release is validated against:
- Structural integrity of all JSON files
- Translation completeness and accuracy
- API functionality across all methods
- Code consistency and years range validation
- Level number matching and code pattern compliance

### CI/CD Automation

- **CI workflow**: Runs on every push/PR with Node 18, 20, and 22 (`lint` + `test`)
- **Publish workflow**: Runs when a GitHub Release is published
- **Version guard**: Release tag must match `package.json` version (`v1.1.0` or `1.1.0`)
- **Publish guard**: Workflow fails if the same version already exists on npm

## Installation

```bash
npm install @sparring/tech-roles-library
```

```bash
yarn add @sparring/tech-roles-library
```

```bash
pnpm add @sparring/tech-roles-library
```

## Quick Start

```javascript
const TechRolesLibrary = require('@sparring/tech-roles-library');

// Initialize library (English by default)
const library = new TechRolesLibrary();

// Get all available roles
const roles = library.getRoles();
console.log(`Total roles: ${roles.length}`); // 78

// Get a specific role by code
const role = library.getRole('BE-L3');
console.log(role.role); // 'Backend Developer'
console.log(role.level); // 'L3 - Junior II'

// Get competencies for a role/level
const competencies = library.getCompetencies('Backend Developer', 'L5');
console.log(competencies.core); // Array of core competencies

// Search for roles by name or category
const results = library.search('fullstack', { limit: 10 });
console.log(results[0].role); // 'Full-Stack Developer'
```

### Interactive Demo

Explore the library with our interactive browser demo:

![Browse Roles - Interactive Demo](https://raw.githubusercontent.com/686f6c61/npm-tech-roles-library/main/assets/02%20npm-tech-role-library.png)

Try the live demo at: https://npm-tech-catalog.onrender.com/

## API Reference

### Initialization

#### new TechRolesLibrary(options?)

Creates a new instance of the Tech Roles Library.

```javascript
const TechRolesLibrary = require('@sparring/tech-roles-library');

// English (default)
const library = new TechRolesLibrary();
const libraryEN = new TechRolesLibrary({ language: 'en' });

// Spanish
const libraryES = new TechRolesLibrary({ language: 'es' });
```

**Options:**
- `language` (string, default: 'en'): Language code ('es' or 'en')

---

### Core Methods

#### getRoles()

Returns an array of all unique role names.

```javascript
const roles = library.getRoles();
console.log(roles.length); // 78
console.log(roles[0]); // 'AI Engineer' (EN) or 'Ingeniero de IA' (ES)
```

**Returns:** `string[]`

---

#### getRole(code)

Gets a specific role entry by its unique code.

```javascript
const role = library.getRole('BE-L3');

console.log(role.role); // 'Backend Developer'
console.log(role.code); // 'BE-L3'
console.log(role.level); // 'L3 - Junior II'
console.log(role.levelNumber); // 3
console.log(role.yearsRange); // { min: 2, max: 3 }
console.log(role.coreCompetencies); // Array of core skills
console.log(role.complementaryCompetencies); // Array of additional skills
console.log(role.indicators); // Array of level indicators
```

**Parameters:**
- `code` (string): Role code (e.g., 'BE-L3', 'FE-L5')

**Returns:** `RoleEntry`

**Throws:** `RoleNotFoundError` when the code does not exist.

---

#### getLevelsForRole(roleName)

Gets all level entries for a specific role name.

```javascript
const backendLevels = library.getLevelsForRole('Backend Developer');
console.log(backendLevels.length); // 9 (L1-L9)

backendLevels.forEach((entry) => {
  console.log(`${entry.code}: ${entry.level}`);
});
```

**Parameters:**
- `roleName` (string): Role name

**Returns:** `RoleEntry[]`

---

#### getCategories()

Returns all available role categories.

```javascript
const categories = library.getCategories();
console.log(categories);
// ['AI/ML', 'Data', 'Infrastructure', 'Product', 'Sales', 'Security', 'Software Engineering']
```

**Returns:** `string[]`

---

#### filterByCategory(category)

Gets all roles belonging to a specific category.

```javascript
const softwareRoles = library.filterByCategory('Software Engineering');
console.log(softwareRoles.length); // Number of software engineering role entries (297 = 33 roles × 9 levels)
```

**Parameters:**
- `category` (string): Category name

**Returns:** `RoleEntry[]`

---

#### getCompetencies(roleName, level, options?)

Gets competencies for a specific role and level.

```javascript
const competencies = library.getCompetencies('Backend Developer', 'L5');

console.log(competencies.core); // Core competencies array
console.log(competencies.complementary); // Complementary competencies array
console.log(competencies.indicators); // Level indicators array
console.log(competencies.code); // Role code
console.log(competencies.yearsRange); // Years experience range
```

**Parameters:**
- `roleName` (string): Role name
- `level` (string|number): Level (e.g., 'L5' or 5)
- `options.includeComplementary` (boolean, default: true): Include complementary competencies
- `options.includeIndicators` (boolean, default: true): Include indicators

**Returns:** `RoleEntry` object with all role details

---

### Search and Filter

#### search(query, options?)

Searches for roles by name or category. Returns unique roles (not individual role-level entries).

Scoring weights:
- Role name match: +10
- Category match: +5

```javascript
// Basic search
const results = library.search('fullstack');

// With limit
const topResults = library.search('backend', { limit: 10 });

results.forEach((result) => {
  console.log(result.role); // Role name
  console.log(result.category); // Category
  console.log(result.matchScore); // Relevance score
  console.log(result.matchedIn); // Where it matched ('role', 'category', or 'both')
});
```

**Parameters:**
- `query` (string): Search term (role name or category)
- `options.limit` (number, default: 20): Maximum results

**Returns:** `Array<{role: string, category: string, matchScore: number, matchedIn: string}>`

**Note:** This search only looks in role names and categories, not in competencies or technologies.

---

#### filterByLevel(level)

Gets all roles at a specific level across all categories.

```javascript
const seniorRoles = library.filterByLevel('L6');
console.log(seniorRoles.length); // 78 (one for each role)
```

**Parameters:**
- `level` (string|number): Level (e.g., 'L6' or 6)

**Returns:** `RoleEntry[]`

---

### Career Path Analysis

#### getLevelsForRole(roleName)

Gets all levels for a specific role (L1-L9).

```javascript
const path = library.getLevelsForRole('Backend Developer');

path.forEach((entry) => {
  console.log(`${entry.code}: ${entry.level}`);
  console.log(`Years: ${entry.yearsRange.min}-${entry.yearsRange.max || '20+'}`);
});
```

**Parameters:**
- `roleName` (string): Role name

**Returns:** `RoleEntry[]`

---

#### getCareerPathComplete(roleName, currentLevel)

Gets complete career view: mastered levels + current + growth path.

```javascript
const career = library.getCareerPathComplete('Backend Developer', 'L5');

console.log(career.masteredLevels); // Array of L1-L4
console.log(career.currentLevel); // L5 entry
console.log(career.growthPath); // Array of L6-L9

console.log(career.summary.totalMasteredCompetencies); // Total mastered
console.log(career.summary.currentLevelCompetencies); // Current level total
console.log(career.summary.progressPercentage); // Overall progress %
```

![Complete Career Path View](https://raw.githubusercontent.com/686f6c61/npm-tech-roles-library/main/assets/04%20npm-tech-role-library.png)

**Parameters:**
- `roleName` (string): Role name
- `currentLevel` (string|number): Current level

**Returns:** `CompleteCareerPath`

---

#### getNextLevel(roleName, currentLevel)

Gets the next level entry for a role with new competencies to learn.

```javascript
const nextLevel = library.getNextLevel('Backend Developer', 'L5');

if (nextLevel) {
  console.log(`Next: ${nextLevel.next.code}`);
  console.log(`Years required: ${nextLevel.next.yearsRange.min}-${nextLevel.next.yearsRange.max || '20+'}`);
  console.log(`New competencies: ${nextLevel.newCompetenciesCount}`);
  console.log(nextLevel.newCompetencies); // Array of new skills to learn
}
```

![Next Level Requirements](https://raw.githubusercontent.com/686f6c61/npm-tech-roles-library/main/assets/03%20npm-tech-role-library.png)

**Parameters:**
- `roleName` (string): Role name
- `currentLevel` (string|number): Current level

**Returns:** `{ current: {...}, next: {...}, newCompetencies: [...], newCompetenciesCount: number } | null`

---

#### getAccumulatedCompetencies(roleName, upToLevel)

Gets all competencies accumulated from L1 to the specified level.

```javascript
const accumulated = library.getAccumulatedCompetencies(
  'Backend Developer',
  'L5'
);

console.log(accumulated.levels); // Array of all levels L1-L5 with full data
console.log(accumulated.targetLevel); // 'L5'
```

**Parameters:**
- `roleName` (string): Role name
- `upToLevel` (string|number): Level to accumulate up to

**Returns:** `{ role: string, targetLevel: string, levels: RoleEntry[] }`

---

#### getByExperience(roleName, years)

Finds the appropriate level for a role based on years of experience.

```javascript
const level = library.getByExperience('Backend Developer', 5);
console.log(level.level); // 'L5 - Mid-level II'
console.log(level.yearsRange); // { min: 5, max: 7 }
```

**Parameters:**
- `roleName` (string): Role name
- `years` (number): Years of experience

**Returns:** `RoleEntry`

---

### Metadata and Statistics

#### getStatistics()

Gets library statistics and metadata.

```javascript
const stats = library.getStatistics();

console.log(stats.totalRoles); // 78
console.log(stats.totalEntries); // 702
console.log(stats.totalCategories); // 7
console.log(stats.byCategory); // Object with category counts
```

**Returns:** `LibraryStatistics`

---

#### getAllRolesWithMetadata()

Gets complete catalog with metadata for all roles.

```javascript
const catalog = library.getAllRolesWithMetadata();

console.log(catalog.roles.length); // 78 roles with metadata
console.log(catalog.byCategory); // Roles grouped by category
console.log(catalog.summary); // Overall statistics

catalog.roles.forEach((roleInfo) => {
  console.log(roleInfo.role); // Role name (translated)
  console.log(roleInfo.category); // Category
  console.log(roleInfo.levelCount); // Number of levels (always 9)
  console.log(roleInfo.availableLevels); // Array of level details
  console.log(roleInfo.statistics); // Competency statistics
});
```

**Returns:** `{ roles: RoleMetadata[], byCategory: {...}, summary: {...} }`

---

## Usage Examples

### Basic Catalog Access

```javascript
const TechRolesLibrary = require('@sparring/tech-roles-library');

// Initialize
const library = new TechRolesLibrary({ language: 'en' });

// Get statistics
const stats = library.getStatistics();
console.log(`Total roles: ${stats.totalRoles}`);
console.log(`Total entries: ${stats.totalEntries}`);

// Browse categories
const categories = library.getCategories();
categories.forEach((category) => {
  const roles = library.filterByCategory(category);
  console.log(`${category}: ${roles.length / 9} roles`);
});
// Output:
// Software Engineering: 33 roles
// AI/ML: 16 roles
// Data: 15 roles
// etc.
```

### Career Planning

```javascript
// Employee at Backend Developer L3 planning growth
const career = library.getCareerPathComplete('Backend Developer', 'L3');

console.log('Mastered levels:');
career.masteredLevels.forEach((level) => {
  console.log(`  ${level.code}: ${level.level}`);
});

console.log('\nCurrent level:');
console.log(`  ${career.currentLevel.code}: ${career.currentLevel.level}`);

console.log('\nGrowth path:');
career.growthPath.forEach((level) => {
  console.log(`  ${level.code}: ${level.level}`);
  console.log(`    Core competencies: ${level.coreCompetencies.length}`);
});

// Get next level requirements
const nextLevel = library.getNextLevel('Backend Developer', 'L3');
console.log('\nTo reach L4, you need to learn:');
nextLevel.newCompetencies.forEach((comp) => {
  console.log(`  - ${comp}`);
});
```

### Bilingual Usage

```javascript
// English (default)
const libEN = new TechRolesLibrary({ language: 'en' });
const roleEN = libEN.getRole('BE-L3');
console.log(roleEN.role); // 'Backend Developer'

// Spanish
const libES = new TechRolesLibrary({ language: 'es' });
const roleES = libES.getRole('BE-L3');
console.log(roleES.role); // 'Desarrollador Backend'
```

## Role Categories

The library organizes 78 technical roles into 7 distinct categories:

| Category | Roles | Description |
|----------|-------|-------------|
| **Software Engineering** | 33 | Full-stack, backend, frontend, mobile developers and engineers |
| **AI/ML** | 16 | Artificial intelligence, machine learning, and data science roles |
| **Data** | 15 | Data engineering, analytics, and business intelligence |
| **Product** | 7 | Product management, ownership, and analysis |
| **Security** | 4 | Security engineering and operations |
| **Infrastructure** | 2 | Platform and infrastructure engineering |
| **Sales** | 1 | Sales development and technical sales |

Each category contains roles spanning all 9 career levels (L1-L9), providing comprehensive career progression paths.

## Career Levels

Each role has 9 standardized career levels:

| Level | Name | Typical Years |
|-------|------|---------------|
| L1 | Trainee | 0-1 |
| L2 | Junior I | 1-2 |
| L3 | Junior II | 2-3 |
| L4 | Mid-level I | 3-5 |
| L5 | Mid-level II | 5-7 |
| L6 | Senior I | 7-10 |
| L7 | Senior II | 10-12 |
| L8 | Staff/Principal | 12-15 |
| L9 | VP/CTO | 15+ |

## Data Structure

### Role Entry

```javascript
{
  category: 'Software Engineering',
  role: 'Backend Developer',
  level: 'L3 - Junior II',
  code: 'BE-L3',
  levelNumber: 3,
  yearsRange: {
    min: 2,
    max: 3
  },
  coreCompetencies: [
    'Proficiency in at least one backend language',
    'Experience with RESTful API development',
    'Database knowledge (SQL or NoSQL)',
    // ...
  ],
  complementaryCompetencies: [
    'Basic understanding of cloud platforms',
    'Familiarity with containerization',
    // ...
  ],
  indicators: [
    'Can work independently on small to medium projects',
    'Contributes to code reviews',
    // ...
  ]
}
```

### Search Result

```javascript
{
  role: 'Full-Stack Developer',
  category: 'Software Engineering',
  matchScore: 10, // 10 for role match, 5 for category match
  matchedIn: 'role' // or 'category' or 'both'
}
```

### Complete Career Path

```javascript
{
  role: 'Backend Developer',
  currentLevel: {
    code: 'BE-L5',
    level: 'L5 - Mid-level II',
    // ... full level data
  },
  masteredLevels: [
    { code: 'BE-L1', level: 'L1 - Trainee', /* ... */ },
    { code: 'BE-L2', level: 'L2 - Junior I', /* ... */ },
    // ... L3, L4
  ],
  growthPath: [
    { code: 'BE-L6', level: 'L6 - Senior I', /* ... */ },
    { code: 'BE-L7', level: 'L7 - Senior II', /* ... */ },
    // ... L8, L9
  ],
  summary: {
    totalMasteredCompetencies: 120,
    currentLevelCompetencies: 35,
    remainingToLearn: 180,
    progressPercentage: 46
  }
}
```

## Bilingual Support

The library provides complete Spanish/English support with lazy-loaded translations. All translations have been thoroughly validated to ensure 100% accuracy and professional terminology.

### Translation System

- **Default language**: English (EN)
- **Supported languages**: Spanish (ES), English (EN)
- **Translation quality**: All translations validated with 0% language mixing and professional technical terminology
- **Neutral Spanish**: Uses neutral Castilian Spanish without regionalisms, suitable for all Spanish-speaking countries
- **Lazy loading**: Translations are loaded on-demand for optimal performance
- **Role names**: All 78 roles have both ES and EN names
- **Competencies**: All competencies, indicators, and descriptions are fully translated

### Translation Examples

**Role names:**

| Español | English |
|---------|---------|
| Ingeniero de IA | AI Engineer |
| Desarrollador Backend | Backend Developer |
| Ingeniero DevOps | DevOps Engineer |
| Científico de Datos | Data Scientist |

**Level names:**

| Español | English |
|---------|---------|
| L1 - Practicante | L1 - Trainee |
| L3 - Junior II | L3 - Junior II |
| L5 - Mid-level II | L5 - Mid-level II |
| L9 - VP/CTO | L9 - VP/CTO |

## Release and Publishing

This repository is configured to publish automatically to npm when a GitHub Release is published.

### Release checklist

1. Update `package.json` version (example: `1.1.0`)
2. Update `CHANGELOG.md` for the new version
3. Run local validation:
   - `npm run lint:check`
   - `npm test`
4. Push changes to GitHub
5. Create a GitHub Release with tag `vX.Y.Z` (recommended) or `X.Y.Z`

If all checks pass, GitHub Actions publishes the package to npm using `NPM_SECRET`.

## Links

- **Homepage**: https://www.686f6c61.dev
- **Repository**: https://github.com/686f6c61/npm-tech-roles-library
- **Issues**: https://github.com/686f6c61/npm-tech-roles-library/issues
- **NPM Package**: https://www.npmjs.com/package/@sparring/tech-roles-library
- **Changelog**: https://github.com/686f6c61/npm-tech-roles-library/blob/main/CHANGELOG.md
- **Live Demo**: https://npm-tech-catalog.onrender.com/

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository at https://github.com/686f6c61/npm-tech-roles-library
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Ensure code is properly formatted: `npm run format`
7. Submit a pull request

### Adding New Roles

To add a new role:

1. Create English translation file in `src/i18n/translations/en/[role-name].json` with all 9 levels
2. Create Spanish translation file in `src/i18n/translations/es/[role-name].json` with all 9 levels
3. Add role name mapping to `src/i18n/role-names.json`
4. Ensure all required fields are present: role, category, levels (L1-L9)
5. Each level must include: level, levelNumber, yearsRange, coreCompetencies, complementaryCompetencies, indicators
6. Run tests to ensure consistency: `npm test`
7. Submit a pull request with detailed description

### Reporting Issues

Please report issues at: https://github.com/686f6c61/npm-tech-roles-library/issues

Include:
- Detailed description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Code examples (if applicable)

## License

MIT License - See LICENSE file for details.

Made with precision by Sparring | https://www.686f6c61.dev

---

**Keywords**: technical roles, career levels, competencies, HR tech, talent management, career development, role framework, skill matrix, technical skills, career path, career progression, bilingual, Spanish, English, job roles, hiring, recruitment, candidate evaluation
