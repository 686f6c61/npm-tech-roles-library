const TechRolesLibrary = require('../../src/index');

describe('TechRolesLibrary', () => {
  let library;

  beforeEach(() => {
    library = new TechRolesLibrary();
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      expect(library.options.language).toBe('en');
      expect(library.options.includeComplementary).toBe(true);
      expect(library.options.includeIndicators).toBe(true);
    });

    test('should lazy load data on first query', () => {
      expect(library.loaded).toBe(false);
      library.getRoles();
      expect(library.loaded).toBe(true);
    });
  });

  describe('Role Queries', () => {
    test('should get all roles', () => {
      const roles = library.getRoles();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThan(0);
      expect(roles).toContain('Backend Developer');
    });

    test('should get role by code', () => {
      const role = library.getRole('BE-L3');
      expect(role).toBeDefined();
      expect(role.role).toBe('Backend Developer'); // English is default
      expect(role.level).toContain('L3');
    });

    test('should get role by name and level', () => {
      const role = library.getRoleByName('Backend Developer', 'L3');
      expect(role).toBeDefined();
      expect(role.role).toBe('Backend Developer'); // English is default
      expect(role.code).toBe('BE-L3');
    });

    test('should get all levels for role', () => {
      const levels = library.getLevelsForRole('Backend Developer');
      expect(levels).toHaveLength(9);
      expect(levels[0].levelNumber).toBe(1);
      expect(levels[8].levelNumber).toBe(9);
    });

    test('should throw error for non-existent role', () => {
      expect(() => library.getRole('XX-L99')).toThrow();
    });
  });

  describe('Competency Queries', () => {
    test('should get competencies for role and level', () => {
      const comp = library.getCompetencies('Backend Developer', 'L3');
      expect(comp).toHaveProperty('role');
      expect(comp).toHaveProperty('level');
      expect(comp).toHaveProperty('core');
      expect(comp).toHaveProperty('complementary');
      expect(comp).toHaveProperty('indicators');
      expect(Array.isArray(comp.core)).toBe(true);
    });

    test('should allow per-call competency options override', () => {
      const comp = library.getCompetencies('Backend Developer', 'L3', {
        includeComplementary: false,
        includeIndicators: false
      });

      expect(comp).toHaveProperty('core');
      expect(comp).not.toHaveProperty('complementary');
      expect(comp).not.toHaveProperty('indicators');
    });

    test('should get core competencies only', () => {
      const core = library.getCoreCompetencies('Backend Developer', 'L3');
      expect(Array.isArray(core)).toBe(true);
      expect(core.length).toBeGreaterThan(0);
    });

    test('should get accumulated competencies', () => {
      const accumulated = library.getAccumulatedCompetencies('Backend Developer', 'L3');
      expect(accumulated.role).toBe('Backend Developer');
      expect(accumulated.targetLevel).toBe('L3');
      expect(accumulated.levels).toHaveLength(3);
    });
  });

  describe('Experience-based Queries', () => {
    test('should get role by experience years', () => {
      const role = library.getByExperience('Backend Developer', 5);
      expect(role).toBeDefined();
      expect(role.yearsRange.min).toBeLessThanOrEqual(5);
    });

    test('should get years range for level', () => {
      const range = library.getYearsRange('Backend Developer', 'L3');
      expect(range).toHaveProperty('min');
      expect(range).toHaveProperty('max');
      expect(range.min).toBe(2);
      expect(range.max).toBe(3);
    });
  });

  describe('Search and Filter', () => {
    test('should perform full-text search', () => {
      const results = library.search('backend');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('role');
      expect(results[0]).toHaveProperty('category');
      expect(results[0]).toHaveProperty('matchScore');
      expect(results[0]).toHaveProperty('matchedIn');
    });

    test('should filter by category', () => {
      const results = library.filterByCategory('Software Engineering');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should filter by level', () => {
      const results = library.filterByLevel(3);
      expect(Array.isArray(results)).toBe(true);
      results.forEach(entry => {
        expect(entry.levelNumber).toBe(3);
      });
    });

    test('should filter by level with L-prefixed string', () => {
      const results = library.filterByLevel('L3');
      expect(Array.isArray(results)).toBe(true);
      results.forEach(entry => {
        expect(entry.levelNumber).toBe(3);
      });
    });
  });

  describe('Career Progression', () => {
    test('should get next level', () => {
      const next = library.getNextLevel('Backend Developer', 'L3');
      expect(next).toHaveProperty('current');
      expect(next).toHaveProperty('next');
      expect(next).toHaveProperty('newCompetencies');
      expect(next.next.level).toContain('L4');
    });

    test('should return null for next level at L9', () => {
      const next = library.getNextLevel('Backend Developer', 'L9');
      expect(next).toBeNull();
    });
  });

  describe('Utilities', () => {
    test('should get all categories', () => {
      const categories = library.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should get statistics', () => {
      const stats = library.getStatistics();
      expect(stats).toHaveProperty('totalRoles');
      expect(stats).toHaveProperty('totalCategories');
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('byCategory');
      expect(stats.totalRoles).toBeGreaterThan(0);
    });

    test('should validate existing role', () => {
      const isValid = library.validateRole('Backend Developer');
      expect(isValid).toBe(true);
    });

    test('should not validate non-existent role', () => {
      const isValid = library.validateRole('Non-Existent Role');
      expect(isValid).toBe(false);
    });

    test('should validate existing level', () => {
      const isValid = library.validateLevel('Backend Developer', 'L3');
      expect(isValid).toBe(true);
    });

    test('should get available levels', () => {
      const levels = library.getAvailableLevels('Backend Developer');
      expect(Array.isArray(levels)).toBe(true);
      expect(levels).toHaveLength(9);
    });
  });

  describe('Export', () => {
    test('should export to JSON', () => {
      const data = { test: 'data' };
      const json = library.export('json', data);
      expect(typeof json).toBe('string');
      expect(JSON.parse(json)).toEqual(data);
    });

    test('should export to markdown', () => {
      const data = {
        role: 'Test Role',
        level: 'L1',
        core: ['Skill 1', 'Skill 2']
      };
      const md = library.export('markdown', data);
      expect(typeof md).toBe('string');
      expect(md).toContain('# Test Role');
      expect(md).toContain('## L1');
    });

    test('should throw error for unsupported format', () => {
      const data = { test: 'data' };
      expect(() => library.export('xml', data)).toThrow();
    });
  });
});
