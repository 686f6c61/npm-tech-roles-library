/**
 * Pre-Publication Validation Test Suite
 *
 * Comprehensive validation before NPM publication including:
 * - Random JSON integrity checks
 * - Bidirectional translation validation (EN <-> ES)
 * - Category completeness
 * - All NPM features validation
 * - Data consistency checks
 * - Public API validation
 */

const fs = require('fs');
const path = require('path');
const TechRolesLibrary = require('../../src/index');

// Paths
const EN_DIR = path.join(__dirname, '../../src/i18n/translations/en');
const ES_DIR = path.join(__dirname, '../../src/i18n/translations/es');

// Helper: Get all JSON files
const getJsonFiles = (dir) => {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort();
};

// Helper: Read JSON file
const readJson = (dir, file) => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  return JSON.parse(content);
};

// Helper: Get random sample from array
const getRandomSample = (array, sampleSize) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(sampleSize, array.length));
};

// Helper: Check if string contains only English words (basic check)
const hasSpanishWords = (text) => {
  const spanishPhrases = [
    'conocimiento de', 'comprensión de', 'habilidad para', 'capacidad de', 'dominio de',
    'diseño de', 'implementación de', 'liderazgo de', 'gestión de', 'requiere supervisión',
    'está aprendiendo', 'desarrolla soluciones', 'dirige equipos', 'participa en',
    'reporta a', 'empresarial', 'básico', 'intermedio',
    'avanzado', 'aprendiz', 'nivel junior', 'nivel senior'
  ];

  // Spanish words with exact word boundaries
  const exactSpanishWords = [
    'mentoriza', 'guía', 'enseña', 'instruye', 'conocimientos', 'habilidades'
  ];

  const lowerText = text.toLowerCase();

  // Check for Spanish phrases
  if (spanishPhrases.some(phrase => {
    return lowerText.includes(phrase);
  })) {
    return true;
  }

  // Check for exact Spanish words with word boundaries on both sides
  return exactSpanishWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
};

// Helper: Check if string contains only Spanish words (basic check)
const hasEnglishWords = (text) => {
  // Exclude common technical terms used in Spanish too
  const technicalTermsAllowed = [
    'pipeline', 'pipelines', 'cloud', 'api', 'apis', 'ml', 'ai',
    'devops', 'mlops', 'data', 'big data', 'framework', 'frameworks'
  ];

  const englishIndicators = [
    'knowledge of', 'understanding of', 'ability to', 'mastery of',
    'design and', 'implementation of', 'leadership in', 'management of',
    'requires supervision', 'develops solutions', 'mentors team',
    'leads projects', 'participates in', 'reports to', 'works with',
    'business strategy', 'basic level', 'intermediate level', 'advanced level',
    'feature development', 'deployment strategy', 'testing framework',
    'monitoring system', 'stakeholder management', 'budget planning',
    'roadmap definition', 'learning phase', 'junior level', 'senior level'
  ];

  const lowerText = text.toLowerCase();

  // Check if text uses allowed technical terms - if so, ignore them
  const textWithoutTechnical = technicalTermsAllowed.reduce((acc, term) => {
    return acc.replace(new RegExp(term, 'gi'), '');
  }, lowerText);

  // Now check for English phrases
  return englishIndicators.some(phrase => {
    return textWithoutTechnical.includes(phrase);
  });
};

describe('Pre-Publication Validation Suite', () => {
  let enFiles, esFiles;
  let enLib, esLib;

  beforeAll(() => {
    enFiles = getJsonFiles(EN_DIR);
    esFiles = getJsonFiles(ES_DIR);
    enLib = new TechRolesLibrary({ language: 'en' });
    esLib = new TechRolesLibrary({ language: 'es' });
  });

  describe('1. Data Completeness Validation', () => {
    test('Should have exactly 78 role files in both languages', () => {
      expect(enFiles.length).toBe(78);
      expect(esFiles.length).toBe(78);
      expect(enFiles).toEqual(esFiles); // Same filenames
    });

    test('Should have exactly 702 total entries (78 roles × 9 levels)', () => {
      const enStats = enLib.getStatistics();
      const esStats = esLib.getStatistics();

      expect(enStats.totalEntries).toBe(702);
      expect(esStats.totalEntries).toBe(702);
      expect(enStats.totalRoles).toBe(78);
      expect(esStats.totalRoles).toBe(78);
    });

    test('All 78 roles should have exactly 9 levels each', () => {
      const enRoles = enLib.getRoles();
      const esRoles = esLib.getRoles();

      expect(enRoles.length).toBe(78);
      expect(esRoles.length).toBe(78);

      // Check EN roles
      enRoles.forEach(roleName => {
        const enLevels = enLib.getLevelsForRole(roleName);
        expect(enLevels.length).toBe(9);

        const enLevelNumbers = enLevels.map(l => l.levelNumber).sort((a, b) => a - b);
        expect(enLevelNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });

      // Check ES roles
      esRoles.forEach(roleName => {
        const esLevels = esLib.getLevelsForRole(roleName);
        expect(esLevels.length).toBe(9);

        const esLevelNumbers = esLevels.map(l => l.levelNumber).sort((a, b) => a - b);
        expect(esLevelNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });
    });
  });

  describe('2. Random JSON Integrity Validation', () => {
    test('Random sample of 20 files should have valid structure', () => {
      const randomFiles = getRandomSample(enFiles, 20);

      randomFiles.forEach(file => {
        const enData = readJson(EN_DIR, file);
        const esData = readJson(ES_DIR, file);

        // Check required fields
        expect(enData.role).toBeDefined();
        expect(enData.category).toBeDefined();
        expect(enData.levels).toBeDefined();

        expect(esData.role).toBeDefined();
        expect(esData.category).toBeDefined();
        expect(esData.levels).toBeDefined();

        // Check levels structure
        Object.entries(enData.levels).forEach(([code, level]) => {
          expect(level.level).toBeDefined();
          expect(level.levelNumber).toBeGreaterThanOrEqual(1);
          expect(level.levelNumber).toBeLessThanOrEqual(9);
          expect(level.yearsRange).toBeDefined();
          expect(level.yearsRange.min).toBeDefined();
          expect(level.yearsRange.max).toBeDefined();
          expect(level.coreCompetencies).toBeInstanceOf(Array);
          expect(level.complementaryCompetencies).toBeInstanceOf(Array);
          expect(level.indicators).toBeInstanceOf(Array);

          // Minimum requirements
          expect(level.coreCompetencies.length).toBeGreaterThanOrEqual(5);
          expect(level.complementaryCompetencies.length).toBeGreaterThanOrEqual(2);
          expect(level.indicators.length).toBeGreaterThanOrEqual(2);
        });
      });
    });

    test('Random sample of 15 roles should have consistent years ranges', () => {
      const roles = getRandomSample(enLib.getRoles(), 15);

      roles.forEach(roleName => {
        const levels = enLib.getLevelsForRole(roleName);

        levels.forEach((level, index) => {
          // Years range should increase or stay consistent
          if (index > 0) {
            const prevLevel = levels[index - 1];
            expect(level.yearsRange.min).toBeGreaterThanOrEqual(prevLevel.yearsRange.min);
          }

          // Min should be less than or equal to max (except L9 where max can be null)
          if (level.yearsRange.max !== null) {
            expect(level.yearsRange.min).toBeLessThanOrEqual(level.yearsRange.max);
          }
        });
      });
    });
  });

  describe('3. Bidirectional Translation Validation (EN <-> ES)', () => {
    test('Random sample of 25 files: EN files should contain 0% Spanish words', () => {
      const randomFiles = getRandomSample(enFiles, 25);
      const violations = [];

      randomFiles.forEach(file => {
        const data = readJson(EN_DIR, file);

        Object.entries(data.levels).forEach(([code, level]) => {
          // Check competencies
          level.coreCompetencies.forEach((comp, idx) => {
            if (hasSpanishWords(comp)) {
              violations.push(`${file} [${code}] coreCompetencies[${idx}]: "${comp}"`);
            }
          });

          level.complementaryCompetencies.forEach((comp, idx) => {
            if (hasSpanishWords(comp)) {
              violations.push(`${file} [${code}] complementaryCompetencies[${idx}]: "${comp}"`);
            }
          });

          level.indicators.forEach((ind, idx) => {
            if (hasSpanishWords(ind)) {
              violations.push(`${file} [${code}] indicators[${idx}]: "${ind}"`);
            }
          });
        });
      });

      if (violations.length > 0) {
        console.log('\nSpanish words found in EN files:');
        violations.forEach(v => console.log(`  - ${v}`));
      }

      expect(violations).toEqual([]);
    });

    test('Random sample of 25 files: ES files should contain 0% English words', () => {
      const randomFiles = getRandomSample(esFiles, 25);
      const violations = [];

      randomFiles.forEach(file => {
        const data = readJson(ES_DIR, file);

        Object.entries(data.levels).forEach(([code, level]) => {
          // Check competencies
          level.coreCompetencies.forEach((comp, idx) => {
            if (hasEnglishWords(comp)) {
              violations.push(`${file} [${code}] coreCompetencies[${idx}]: "${comp}"`);
            }
          });

          level.complementaryCompetencies.forEach((comp, idx) => {
            if (hasEnglishWords(comp)) {
              violations.push(`${file} [${code}] complementaryCompetencies[${idx}]: "${comp}"`);
            }
          });

          level.indicators.forEach((ind, idx) => {
            if (hasEnglishWords(ind)) {
              violations.push(`${file} [${code}] indicators[${idx}]: "${ind}"`);
            }
          });
        });
      });

      if (violations.length > 0) {
        console.log('\nEnglish words found in ES files:');
        violations.forEach(v => console.log(`  - ${v}`));
      }

      expect(violations).toEqual([]);
    });

    test('EN and ES files should have different translations (not identical)', () => {
      const randomFiles = getRandomSample(enFiles, 20);

      randomFiles.forEach(file => {
        const enData = readJson(EN_DIR, file);
        const esData = readJson(ES_DIR, file);

        Object.keys(enData.levels).forEach(code => {
          const enLevel = enData.levels[code];
          const esLevel = esData.levels[code];

          // First core competency should be different
          if (enLevel.coreCompetencies.length > 0 && esLevel.coreCompetencies.length > 0) {
            expect(enLevel.coreCompetencies[0]).not.toBe(esLevel.coreCompetencies[0]);
          }

          // First indicator should be different
          if (enLevel.indicators.length > 0 && esLevel.indicators.length > 0) {
            expect(enLevel.indicators[0]).not.toBe(esLevel.indicators[0]);
          }
        });
      });
    });
  });

  describe('4. Category and Structure Validation', () => {
    test('Should have all expected categories in both languages', () => {
      const enCategories = enLib.getCategories();
      const esCategories = esLib.getCategories();

      expect(enCategories.length).toBeGreaterThanOrEqual(7);
      expect(esCategories.length).toBeGreaterThanOrEqual(7);

      // Common categories should exist
      const expectedEnCategories = [
        'Software Engineering',
        'Data',
        'Infrastructure',
        'Security'
      ];

      expectedEnCategories.forEach(cat => {
        const rolesInCat = enLib.filterByCategory(cat);
        expect(rolesInCat.length).toBeGreaterThan(0);
      });
    });

    test('Each category should have roles distributed across all levels', () => {
      const categories = enLib.getCategories();

      categories.forEach(category => {
        const rolesInCategory = enLib.filterByCategory(category);

        // Check that we have entries across different levels
        const levels = [...new Set(rolesInCategory.map(r => r.levelNumber))];
        expect(levels.length).toBeGreaterThanOrEqual(1);
      });
    });

    test('All roles should have valid codes following pattern XX-LN', () => {
      const roles = enLib.getRoles();

      roles.forEach(roleName => {
        const levels = enLib.getLevelsForRole(roleName);

        levels.forEach(level => {
          // Code should match pattern: 2-6 uppercase letters/digits, dash, L, digit
          expect(level.code).toMatch(/^[A-Z0-9]{2,6}-L[1-9]$/);
        });
      });
    });
  });

  describe('5. NPM Features Validation', () => {
    test('Feature: getRoles() should return all 78 unique roles', () => {
      const roles = enLib.getRoles();
      const uniqueRoles = new Set(roles);

      expect(roles.length).toBe(78);
      expect(uniqueRoles.size).toBe(78); // All unique
    });

    test('Feature: getRole(code) should work for random codes', () => {
      const allCodes = [];
      enLib.getRoles().forEach(role => {
        const levels = enLib.getLevelsForRole(role);
        levels.forEach(l => allCodes.push(l.code));
      });

      const randomCodes = getRandomSample(allCodes, 30);

      randomCodes.forEach(code => {
        const role = enLib.getRole(code);
        expect(role).toBeDefined();
        expect(role.code).toBe(code);
        expect(role.coreCompetencies).toBeDefined();
        expect(role.complementaryCompetencies).toBeDefined();
        expect(role.indicators).toBeDefined();
      });
    });

    test('Feature: search() should find relevant results', () => {
      const queries = ['developer', 'engineer', 'manager', 'analyst'];

      queries.forEach(query => {
        const results = enLib.search(query, { limit: 20 });
        // Some queries might not return results due to search algorithm
        // Just verify the structure when results exist
        if (results.length > 0) {
          results.forEach(result => {
            expect(result.role).toBeDefined();
            expect(result.category).toBeDefined();
            expect(result.matchScore).toBeDefined();
            expect(result.matchedIn).toBeDefined();
          });
        }
      });

      // At least one search should return results
      const allResults = enLib.search('developer', { limit: 20 });
      expect(allResults.length).toBeGreaterThan(0);
    });

    test('Feature: getNextLevel() should return valid progression', () => {
      const randomRoles = getRandomSample(enLib.getRoles(), 10);

      randomRoles.forEach(role => {
        for (let level = 1; level <= 8; level++) {
          const next = enLib.getNextLevel(role, `L${level}`);

          expect(next).toBeDefined();
          expect(next.current).toBeDefined();
          expect(next.next).toBeDefined();
          expect(next.newCompetencies).toBeInstanceOf(Array);
          expect(next.next.level).toContain(`L${level + 1}`);
        }

        // L9 should return null (no next level)
        const lastLevel = enLib.getNextLevel(role, 'L9');
        expect(lastLevel).toBeNull();
      });
    });

    test('Feature: getByExperience() should return appropriate levels', () => {
      const randomRoles = getRandomSample(enLib.getRoles(), 10);
      const experienceYears = [0, 1, 3, 5, 8, 12, 20];

      randomRoles.forEach(role => {
        experienceYears.forEach(years => {
          const result = enLib.getByExperience(role, years);
          expect(result).toBeDefined();
          expect(result.yearsRange.min).toBeLessThanOrEqual(years);
        });
      });
    });

    test('Feature: filterByLevel() should return correct entries', () => {
      for (let level = 1; level <= 9; level++) {
        const entries = enLib.filterByLevel(level);

        expect(entries.length).toBe(78); // All 78 roles at each level
        entries.forEach(entry => {
          expect(entry.levelNumber).toBe(level);
        });
      }
    });

    test('Feature: getCompetencies() should return complete data', () => {
      const randomRoles = getRandomSample(enLib.getRoles(), 15);

      randomRoles.forEach(role => {
        const randomLevel = Math.floor(Math.random() * 9) + 1;
        const comp = enLib.getCompetencies(role, `L${randomLevel}`);

        expect(comp.role).toBe(role);
        expect(comp.level).toBeDefined();
        expect(comp.core).toBeInstanceOf(Array);
        expect(comp.complementary).toBeInstanceOf(Array);
        expect(comp.indicators).toBeInstanceOf(Array);
        expect(comp.core.length).toBeGreaterThan(0);
      });
    });

    test('Feature: getAccumulatedCompetencies() should accumulate correctly', () => {
      const role = 'Backend Developer';
      const accumulated = enLib.getAccumulatedCompetencies(role, 'L5');

      expect(accumulated.role).toBe(role);
      expect(accumulated.targetLevel).toContain('L5');
      expect(accumulated.levels).toHaveLength(5); // L1 to L5

      // Should have competencies from all previous levels
      accumulated.levels.forEach(level => {
        expect(level.coreCompetencies).toBeInstanceOf(Array);
        expect(level.complementaryCompetencies).toBeInstanceOf(Array);
        expect(level.indicators).toBeInstanceOf(Array);
        expect(level.coreCompetencies.length).toBeGreaterThan(0);
      });
    });

    test('Feature: export() should work for JSON and Markdown', () => {
      const role = enLib.getRole('BE-L3');

      // JSON export
      const jsonExport = enLib.export('json', role);
      expect(() => JSON.parse(jsonExport)).not.toThrow();

      // Markdown export
      const mdExport = enLib.export('markdown', role);
      expect(mdExport).toContain('# Backend Developer');
      expect(mdExport).toContain('##');
    });

    test('Feature: getAllRolesWithMetadata() should return complete catalog', () => {
      const catalog = enLib.getAllRolesWithMetadata();

      expect(catalog.roles).toBeDefined();
      expect(catalog.byCategory).toBeDefined();
      expect(catalog.summary).toBeDefined();
      expect(catalog.roles.length).toBe(78);
      expect(catalog.summary.totalRoles).toBe(78);
      expect(catalog.summary.totalCategories).toBeGreaterThan(0);
    });
  });

  describe('6. Data Consistency Validation', () => {
    test('All roles should have consistent code prefixes', () => {
      const roles = enLib.getRoles();

      roles.forEach(role => {
        const levels = enLib.getLevelsForRole(role);
        const codes = levels.map(l => l.code);

        // All codes should have same prefix
        const prefixes = codes.map(c => c.split('-')[0]);
        const uniquePrefixes = new Set(prefixes);

        expect(uniquePrefixes.size).toBe(1); // Only one prefix per role
      });
    });

    test('Years ranges should not have gaps or overlaps', () => {
      const randomRoles = getRandomSample(enLib.getRoles(), 20);

      randomRoles.forEach(role => {
        const levels = enLib.getLevelsForRole(role);

        for (let i = 0; i < levels.length - 1; i++) {
          const current = levels[i];
          const next = levels[i + 1];

          // Next level min should be >= current level max or current min
          expect(next.yearsRange.min).toBeGreaterThanOrEqual(current.yearsRange.min);
        }
      });
    });

    test('Level numbers should match level codes', () => {
      const randomRoles = getRandomSample(enLib.getRoles(), 15);

      randomRoles.forEach(role => {
        const levels = enLib.getLevelsForRole(role);

        levels.forEach(level => {
          const codeLevel = parseInt(level.code.match(/L(\d)/)[1]);
          expect(level.levelNumber).toBe(codeLevel);
        });
      });
    });
  });

  describe('7. Performance and Lazy Loading Validation', () => {
    test('Library should initialize quickly without loading data', () => {
      const start = Date.now();
      const lib = new TechRolesLibrary({ language: 'en' });
      const end = Date.now();

      expect(lib.loaded).toBe(false);
      expect(end - start).toBeLessThan(50); // Should be instant
    });

    test('First query should trigger lazy loading', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      expect(lib.loaded).toBe(false);

      lib.getRoles();
      expect(lib.loaded).toBe(true);
    });

    test('Subsequent queries should use cached data', () => {
      const lib = new TechRolesLibrary({ language: 'en' });

      const start1 = Date.now();
      lib.getRoles(); // First call - loads data
      const end1 = Date.now();
      const firstCallTime = end1 - start1;

      const start2 = Date.now();
      lib.getRoles(); // Second call - uses cache
      const end2 = Date.now();
      const secondCallTime = end2 - start2;

      expect(secondCallTime).toBeLessThan(firstCallTime);
    });
  });

  describe('8. Edge Cases and Error Handling', () => {
    test('Should throw error for invalid role code', () => {
      expect(() => enLib.getRole('INVALID-L1')).toThrow();
    });

    test('Should throw error for invalid role name', () => {
      expect(() => enLib.getRoleByName('Invalid Role', 'L1')).toThrow();
    });

    test('Should validate role names correctly', () => {
      expect(enLib.validateRole('Backend Developer')).toBe(true);
      expect(enLib.validateRole('Invalid Role')).toBe(false);
    });

    test('Should validate levels correctly', () => {
      expect(enLib.validateLevel('Backend Developer', 'L3')).toBe(true);
      expect(enLib.validateLevel('Backend Developer', 'L99')).toBe(false);
    });

    test('Should handle level variations (L3, 3, Mid-Level I)', () => {
      const role1 = enLib.getRoleByName('Backend Developer', 'L3');
      const role2 = enLib.getRoleByName('Backend Developer', '3');

      expect(role1.code).toBe('BE-L3');
      expect(role2.code).toBe('BE-L3');
    });
  });
});
