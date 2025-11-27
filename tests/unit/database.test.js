const CompetencyDatabase = require('../../src/core/database');

describe('CompetencyDatabase', () => {
  let db;
  const mockEntries = [
    {
      category: 'Software Engineering',
      role: 'Backend Developer',
      level: 'L1 - Trainee',
      code: 'BE-L1',
      levelNumber: 1,
      yearsRange: { min: 0, max: 1 },
      coreCompetencies: ['Basic HTTP', 'Simple queries'],
      complementaryCompetencies: ['Git basics'],
      indicators: ['Requires supervision']
    },
    {
      category: 'Software Engineering',
      role: 'Backend Developer',
      level: 'L2 - Junior I',
      code: 'BE-L2',
      levelNumber: 2,
      yearsRange: { min: 1, max: 2 },
      coreCompetencies: ['REST APIs', 'Database design'],
      complementaryCompetencies: ['Docker basics'],
      indicators: ['Works with supervision']
    },
    {
      category: 'Software Engineering',
      role: 'Frontend Developer',
      level: 'L1 - Trainee',
      code: 'FE-L1',
      levelNumber: 1,
      yearsRange: { min: 0, max: 1 },
      coreCompetencies: ['HTML', 'CSS', 'Basic JavaScript'],
      complementaryCompetencies: ['Design basics'],
      indicators: ['Requires supervision']
    }
  ];

  beforeEach(() => {
    db = new CompetencyDatabase();
    db.load(mockEntries);
  });

  test('should load entries successfully', () => {
    expect(db.entries).toHaveLength(3);
  });

  test('should build code index correctly', () => {
    const entry = db.getByCode('BE-L1');
    expect(entry).toBeDefined();
    expect(entry.role).toBe('Backend Developer');
    expect(entry.levelNumber).toBe(1);
  });

  test('should build role index correctly', () => {
    const entries = db.getByRole('Backend Developer');
    expect(entries).toHaveLength(2);
    expect(entries[0].levelNumber).toBe(1);
    expect(entries[1].levelNumber).toBe(2);
  });

  test('should build category index correctly', () => {
    const entries = db.getByCategory('Software Engineering');
    expect(entries).toHaveLength(3);
  });

  test('should build competency index correctly', () => {
    const entries = db.searchByCompetency('basic http');
    expect(entries).toHaveLength(1);
    expect(entries[0].code).toBe('BE-L1');
  });

  test('should return all roles sorted', () => {
    const roles = db.getAllRoles();
    expect(roles).toContain('Backend Developer');
    expect(roles).toContain('Frontend Developer');
    expect(roles.length).toBe(2);
  });

  test('should return all categories sorted', () => {
    const categories = db.getAllCategories();
    expect(categories).toContain('Software Engineering');
    expect(categories.length).toBe(1);
  });

  test('should return statistics', () => {
    const stats = db.getStatistics();
    expect(stats.totalRoles).toBe(2);
    expect(stats.totalCategories).toBe(1);
    expect(stats.totalEntries).toBe(3);
    expect(stats.averageEntriesPerRole).toBe(2);
  });

  test('should sort role entries by level number', () => {
    const entries = db.getByRole('Backend Developer');
    expect(entries[0].levelNumber).toBeLessThan(entries[1].levelNumber);
  });

  test('should handle case-insensitive competency search', () => {
    const entries = db.searchByCompetency('BASIC HTTP');
    expect(entries).toHaveLength(1);
  });

  test('should return empty array for non-existent role', () => {
    const entries = db.getByRole('Non-Existent Role');
    expect(entries).toHaveLength(0);
  });

  test('should return undefined for non-existent code', () => {
    const entry = db.getByCode('XX-L99');
    expect(entry).toBeUndefined();
  });
});
