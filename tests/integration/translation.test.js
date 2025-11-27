const TechRolesLibrary = require('../../src/index');

describe('Translation Integration', () => {
  describe('Language Initialization', () => {
    test('should initialize with English', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      const role = lib.getRole('BE-L1');

      expect(role.coreCompetencies).toBeDefined();
      expect(role.coreCompetencies[0]).toMatch(/basic|understanding|knowledge/i);
    });

    test('should initialize with Spanish (default)', () => {
      const lib = new TechRolesLibrary({ language: 'es' });
      const role = lib.getRole('BE-L1');

      expect(role.coreCompetencies).toBeDefined();
      expect(role.coreCompetencies[0]).toMatch(/básico|comprensión|conocimiento/i);
    });
  });

  describe('Translation Completeness', () => {
    test('should translate all fields for a role', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      const competencies = lib.getCompetencies('Backend Developer', 'L1');

      expect(competencies.core).toBeDefined();
      expect(competencies.complementary).toBeDefined();
      expect(competencies.indicators).toBeDefined();

      expect(competencies.core.length).toBeGreaterThan(0);
      expect(competencies.complementary.length).toBeGreaterThan(0);
      expect(competencies.indicators.length).toBeGreaterThan(0);
    });

    test('should translate all levels for a role', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      const levels = lib.getLevelsForRole('Backend Developer');

      expect(levels.length).toBe(9);
      levels.forEach(level => {
        expect(level.coreCompetencies.length).toBeGreaterThan(0);
        expect(level.complementaryCompetencies.length).toBeGreaterThan(0);
        expect(level.indicators.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Translation Differences', () => {
    test('should have different translations in EN and ES', () => {
      const enLib = new TechRolesLibrary({ language: 'en' });
      const esLib = new TechRolesLibrary({ language: 'es' });

      const enRole = enLib.getRole('BE-L1');
      const esRole = esLib.getRole('BE-L1');

      // Should be different translations
      expect(enRole.coreCompetencies[0]).not.toBe(esRole.coreCompetencies[0]);
      expect(enRole.complementaryCompetencies[0]).not.toBe(esRole.complementaryCompetencies[0]);
      expect(enRole.indicators[0]).not.toBe(esRole.indicators[0]);
    });
  });

  describe('Search with Translation', () => {
    test('should search in English', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      const results = lib.search('backend');

      expect(results.length).toBeGreaterThan(0);
      // Verify results have correct structure
      const firstResult = results[0];
      expect(firstResult.role).toBeDefined();
      expect(firstResult.category).toBeDefined();
      expect(firstResult.matchScore).toBeDefined();
      expect(firstResult.matchedIn).toBeDefined();
    });

    test('should search in Spanish', () => {
      const lib = new TechRolesLibrary({ language: 'es' });
      const results = lib.search('backend');

      expect(results.length).toBeGreaterThan(0);
      // Verify results have correct structure
      const firstResult = results[0];
      expect(firstResult.role).toBeDefined();
      expect(firstResult.category).toBeDefined();
      expect(firstResult.matchScore).toBeDefined();
      expect(firstResult.matchedIn).toBeDefined();
    });
  });


  describe('Multiple Roles Translation', () => {
    test('should translate all 78 roles correctly', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      const roles = lib.getRoles();

      expect(roles.length).toBe(78);

      // Sample a few roles to verify translation works
      const samplesToTest = [
        'Backend Developer',
        'Frontend Developer',
        'Data Scientist',
        'DevOps Engineer',
        'Security Engineer',
        'QA Engineer',
        'Product Manager'
      ];

      samplesToTest.forEach(roleName => {
        const levels = lib.getLevelsForRole(roleName);
        expect(levels.length).toBeGreaterThan(0);

        levels.forEach(level => {
          expect(level.coreCompetencies.length).toBeGreaterThan(0);
          expect(level.complementaryCompetencies.length).toBeGreaterThan(0);
          expect(level.indicators.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle roles with 9 levels', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      const levels = lib.getLevelsForRole('Backend Developer');

      expect(levels.length).toBe(9);

      // Test first and last level
      const firstLevel = lib.getRole('BE-L1');
      const lastLevel = lib.getRole('BE-L9');

      expect(firstLevel.coreCompetencies.length).toBeGreaterThan(0);
      expect(lastLevel.coreCompetencies.length).toBeGreaterThan(0);
    });

    test('should preserve metadata during translation', () => {
      const lib = new TechRolesLibrary({ language: 'en' });
      const role = lib.getRole('BE-L1');

      expect(role.code).toBe('BE-L1');
      expect(role.role).toBe('Backend Developer');
      expect(role.levelNumber).toBe(1);
      expect(role.yearsRange).toBeDefined();
    });
  });
});
