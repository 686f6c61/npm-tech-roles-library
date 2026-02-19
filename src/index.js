/**
 * Tech Roles Library
 *
 * A comprehensive library for managing technical roles, career levels, and competency frameworks.
 * Provides 78 technical roles across 9 career levels with bilingual support (EN/ES).
 *
 * @module tech-roles-library
 * @author 686f6c61
 * @license MIT
 * @version 1.1.0
 * @see {@link https://github.com/686f6c61/npm-tech-roles-library}
 */

const path = require('path');
const JSONParser = require('./core/json-parser');
const CompetencyDatabase = require('./core/database');
const QueryAPI = require('./api/queries');
const FilterAPI = require('./api/filters');
const ComparisonAPI = require('./api/comparisons');
const { Validator } = require('./core/validator');
const Translator = require('./i18n/translator');

/**
 * Main library class for accessing tech roles and competency data.
 *
 * @class TechRolesLibrary
 * @example
 * const TechRolesLibrary = require('tech-roles-library');
 * const library = new TechRolesLibrary({ language: 'en' });
 * const roles = library.getRoles();
 */
class TechRolesLibrary {
  /**
   * Creates a new instance of TechRolesLibrary.
   *
   * @param {Object} [options={}] - Configuration options
   * @param {string} [options.language='es'] - Language for translations ('en' or 'es')
   * @param {boolean} [options.includeComplementary=true] - Include complementary competencies
   * @param {boolean} [options.includeIndicators=true] - Include level indicators
   * @param {string} [options.csvPath] - Custom path to CSV data file
   */
  constructor(options = {}) {
    this.options = {
      language: options.language || 'en',
      includeComplementary: options.includeComplementary !== false,
      includeIndicators: options.includeIndicators !== false,
      translationsDir: options.translationsDir || null
    };

    this.database = null;
    this.translator = null;
    this.queryAPI = null;
    this.filterAPI = null;
    this.comparisonAPI = null;
    this.loaded = false;
  }

  /**
   * Ensures data is loaded before queries.
   * Lazy loads the CSV data, database, and APIs on first use.
   *
   * @private
   */
  ensureLoaded() {
    if (this.loaded) return;

    // Determine translations directory based on language
    const translationsDir = this.options.translationsDir ||
      path.join(__dirname, `i18n/translations/${this.options.language}`);

    const parser = new JSONParser(translationsDir);
    const entries = parser.parse();

    this.database = new CompetencyDatabase();
    this.database.load(entries);

    // Initialize translator
    this.translator = new Translator(this.options.language);

    // Pass translator to QueryAPI
    this.queryAPI = new QueryAPI(this.database, this.translator);
    this.filterAPI = new FilterAPI(this.database);
    this.comparisonAPI = new ComparisonAPI(this.database, this.queryAPI);

    this.loaded = true;
  }

  // ========================================
  // ROLE QUERIES
  // ========================================

  /**
   * Get all available role names.
   *
   * @returns {string[]} Array of all role names (78 roles)
   * @example
   * const roles = library.getRoles();
   * // ['Backend Developer', 'Frontend Developer', ...]
   */
  getRoles() {
    this.ensureLoaded();
    return this.queryAPI.getRoles();
  }

  /**
   * Get role details by code.
   *
   * @param {string} code - Role code (e.g., 'BE-L3', 'FE-L4')
   * @returns {Object} Role entry with competencies and metadata
   * @throws {RoleNotFoundError} If code doesn't exist
   * @example
   * const role = library.getRole('BE-L3');
   * // { role: 'Backend Developer', level: 'L3', code: 'BE-L3', ... }
   */
  getRole(code) {
    this.ensureLoaded();
    return this.queryAPI.getRoleByCode(code);
  }

  /**
   * Get role details by name and level.
   *
   * @param {string} name - Role name (e.g., 'Backend Developer')
   * @param {string|number} level - Level (e.g., 'L3', 3, 'Mid-Level I')
   * @returns {Object} Role entry with competencies and metadata
   * @throws {RoleNotFoundError} If role name doesn't exist
   * @throws {LevelNotFoundError} If level doesn't exist for this role
   * @example
   * const role = library.getRoleByName('Backend Developer', 'L3');
   */
  getRoleByName(name, level) {
    this.ensureLoaded();
    return this.queryAPI.getRoleByNameAndLevel(name, level);
  }

  /**
   * Get all levels for a specific role.
   *
   * @param {string} roleName - Role name
   * @returns {Object[]} Array of all level entries for this role (L1-L9)
   * @throws {RoleNotFoundError} If role doesn't exist
   * @example
   * const levels = library.getLevelsForRole('Backend Developer');
   * // [{ level: 'L1', ... }, { level: 'L2', ... }, ...]
   */
  getLevelsForRole(roleName) {
    this.ensureLoaded();
    return this.queryAPI.getAllLevelsForRole(roleName);
  }

  // ========================================
  // COMPETENCY QUERIES
  // ========================================

  /**
   * Get competencies for a specific role and level.
   *
   * @param {string} roleName - Role name
   * @param {string|number} level - Level identifier
   * @param {Object} [options={}] - Query options for this call
   * @param {boolean} [options.includeComplementary] - Override complementary competencies inclusion
   * @param {boolean} [options.includeIndicators] - Override indicators inclusion
   * @returns {Object} Competencies object with core, complementary, and indicators
   * @example
   * const competencies = library.getCompetencies('Backend Developer', 'L3');
   * // { role: '...', level: '...', core: [...], complementary: [...], indicators: [...] }
   */
  getCompetencies(roleName, level, options = {}) {
    this.ensureLoaded();
    const includeComplementary = options.includeComplementary ?? this.options.includeComplementary;
    const includeIndicators = options.includeIndicators ?? this.options.includeIndicators;
    return this.queryAPI.getCompetencies(roleName, level, {
      includeComplementary,
      includeIndicators
    });
  }

  /**
   * Get only core competencies for a role and level.
   *
   * @param {string} roleName - Role name
   * @param {string|number} level - Level identifier
   * @returns {string[]} Array of core competencies
   * @example
   * const core = library.getCoreCompetencies('Backend Developer', 'L3');
   */
  getCoreCompetencies(roleName, level) {
    this.ensureLoaded();
    const result = this.queryAPI.getCompetencies(roleName, level, {
      includeComplementary: false,
      includeIndicators: false
    });
    return result.core;
  }

  /**
   * Get only complementary competencies for a role and level.
   *
   * @param {string} roleName - Role name
   * @param {string|number} level - Level identifier
   * @returns {string[]} Array of complementary competencies
   * @example
   * const complementary = library.getComplementaryCompetencies('Backend Developer', 'L3');
   */
  getComplementaryCompetencies(roleName, level) {
    this.ensureLoaded();
    const entry = this.queryAPI.getRoleByNameAndLevel(roleName, level);
    return entry.complementaryCompetencies;
  }

  /**
   * Get accumulated competencies from L1 to target level.
   *
   * @param {string} roleName - Role name
   * @param {string|number} level - Target level
   * @returns {Object} Accumulated competencies across all levels up to target
   * @example
   * const accumulated = library.getAccumulatedCompetencies('Backend Developer', 'L5');
   */
  getAccumulatedCompetencies(roleName, level) {
    this.ensureLoaded();
    return this.queryAPI.getAccumulatedCompetencies(roleName, level);
  }

  /**
   * Get complete career path view (mastered + current + growth).
   * Perfect for HR dashboards and career planning.
   *
   * @param {string} roleName - Role name
   * @param {string|number} currentLevel - Current level
   * @returns {Object} Complete career view with mastered, current, and growth paths
   * @example
   * const career = library.getCareerPathComplete('Backend Developer', 'L5');
   * // { masteredLevels: [...], currentLevel: {...}, growthPath: [...], summary: {...} }
   */
  getCareerPathComplete(roleName, currentLevel) {
    this.ensureLoaded();
    return this.queryAPI.getCareerPathComplete(roleName, currentLevel);
  }

  // ========================================
  // EXPERIENCE-BASED QUERIES
  // ========================================

  /**
   * Get recommended level based on years of experience.
   *
   * @param {string} roleName - Role name
   * @param {number} years - Years of experience
   * @returns {Object} Recommended level entry
   * @throws {Error} If years is not a positive number
   * @example
   * const recommended = library.getByExperience('Backend Developer', 5);
   * // Returns L4 or L5 based on experience mapping
   */
  getByExperience(roleName, years) {
    this.ensureLoaded();
    return this.queryAPI.getByExperience(roleName, years);
  }

  /**
   * Get years range for a specific role and level.
   *
   * @param {string} roleName - Role name
   * @param {string|number} level - Level identifier
   * @returns {Object} Years range object with min and max
   * @example
   * const range = library.getYearsRange('Backend Developer', 'L3');
   * // { min: 2, max: 4 }
   */
  getYearsRange(roleName, level) {
    this.ensureLoaded();
    const entry = this.queryAPI.getRoleByNameAndLevel(roleName, level);
    return entry.yearsRange;
  }

  // ========================================
  // SEARCH & FILTER
  // ========================================

  /**
   * Search for roles by name or category.
   * Returns unique roles (not individual role-level entries).
   *
   * @param {string} query - Search term (role name or category)
   * @param {Object} [options] - Search options
   * @param {number} [options.limit=20] - Maximum results to return
   * @returns {Object[]} Array of unique roles with match scores
   * @example
   * const results = library.search('fullstack', { limit: 10 });
   * // Returns:
   * // [
   * //   {
   * //     role: 'Full-Stack Developer',
   * //     category: 'Software Engineering',
   * //     matchScore: 10,
   * //     matchedIn: 'role'
   * //   }
   * // ]
   */
  search(query, options = {}) {
    this.ensureLoaded();
    return this.filterAPI.search(query, options);
  }

  /**
   * Filter entries by category.
   *
   * @param {string} category - Category name (e.g., 'Software Engineering')
   * @returns {Object[]} Array of entries in this category
   * @example
   * const entries = library.filterByCategory('AI/ML');
   */
  filterByCategory(category) {
    this.ensureLoaded();
    return this.queryAPI.filterByCategory(category);
  }

  /**
   * Filter entries by level number.
   *
   * @param {string|number} levelNumber - Level number (L1-L9 or 1-9)
   * @returns {Object[]} Array of entries at this level
   * @throws {Error} If level number is not between 1 and 9
   * @example
   * const seniorRoles = library.filterByLevel(6); // All L6 entries
   */
  filterByLevel(levelNumber) {
    this.ensureLoaded();
    return this.queryAPI.filterByLevel(levelNumber);
  }

  // ========================================
  // CAREER PROGRESSION
  // ========================================

  /**
   * Get next level requirements for a role.
   *
   * @param {string} role - Role name
   * @param {string|number} currentLevel - Current level
   * @returns {Object|null} Next level details and new competencies, or null if at max level
   * @example
   * const next = library.getNextLevel('Backend Developer', 'L3');
   * // { current: {...}, next: {...}, newCompetencies: [...], newCompetenciesCount: 5 }
   */
  getNextLevel(role, currentLevel) {
    this.ensureLoaded();
    const normalizedLevel = Validator.normalizeLevel(currentLevel);
    const currentNum = parseInt(normalizedLevel.match(/\d/)[0]);

    if (currentNum >= 9) {
      return null;
    }

    const nextNum = currentNum + 1;
    const nextLevel = this.queryAPI.getRoleByNameAndLevel(role, `L${nextNum}`);
    const comparison = this.comparisonAPI.compareLevels(role, normalizedLevel, nextLevel.level);

    return {
      current: {
        level: normalizedLevel,
        yearsRange: this.getYearsRange(role, normalizedLevel)
      },
      next: {
        level: nextLevel.level,
        code: nextLevel.code,
        yearsRange: nextLevel.yearsRange,
        coreCompetencies: nextLevel.coreCompetencies,
        complementaryCompetencies: nextLevel.complementaryCompetencies,
        indicators: nextLevel.indicators
      },
      newCompetencies: comparison.new,
      newCompetenciesCount: comparison.new.length
    };
  }

  // ========================================
  // UTILITIES
  // ========================================

  /**
   * Get all available categories.
   *
   * @returns {string[]} Array of category names
   * @example
   * const categories = library.getCategories();
   * // ['Software Engineering', 'AI/ML', 'Data', 'Infrastructure', ...]
   */
  getCategories() {
    this.ensureLoaded();
    return this.queryAPI.getCategories();
  }

  /**
   * Get complete metadata for all 78 roles.
   * Perfect for building catalogs, navigation, and dashboards.
   *
   * @returns {Object} Complete catalog with roles, byCategory, and summary
   * @example
   * const catalog = library.getAllRolesWithMetadata();
   * // { roles: [...], byCategory: {...}, summary: {...} }
   */
  getAllRolesWithMetadata() {
    this.ensureLoaded();
    return this.queryAPI.getAllRolesWithMetadata();
  }

  /**
   * Get database statistics.
   *
   * @returns {Object} Statistics about roles, categories, and entries
   * @example
   * const stats = library.getStatistics();
   * // { totalRoles: 78, totalCategories: 7, totalEntries: 702, ... }
   */
  getStatistics() {
    this.ensureLoaded();
    return this.database.getStatistics();
  }

  /**
   * Validate if a role name exists.
   *
   * @param {string} roleName - Role name to validate
   * @returns {boolean} True if role exists
   * @example
   * const exists = library.validateRole('Backend Developer'); // true
   */
  validateRole(roleName) {
    this.ensureLoaded();
    return this.database.indexes.byRole.has(roleName);
  }

  /**
   * Validate if a level exists for a role.
   *
   * @param {string} roleName - Role name
   * @param {string|number} level - Level to validate
   * @returns {boolean} True if level exists for this role
   * @example
   * const exists = library.validateLevel('Backend Developer', 'L3'); // true
   */
  validateLevel(roleName, level) {
    this.ensureLoaded();
    try {
      this.queryAPI.getRoleByNameAndLevel(roleName, level);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all available levels for a role.
   *
   * @param {string} roleName - Role name
   * @returns {string[]} Array of level identifiers
   * @example
   * const levels = library.getAvailableLevels('Backend Developer');
   * // ['L1 - Trainee', 'L2 - Junior I', ...]
   */
  getAvailableLevels(roleName) {
    this.ensureLoaded();
    const levels = this.queryAPI.getAllLevelsForRole(roleName);
    return levels.map(l => l.level);
  }

  // ========================================
  // EXPORT
  // ========================================

  /**
   * Export data in different formats.
   *
   * @param {string} format - Export format ('json' or 'markdown')
   * @param {Object} data - Data to export
   * @returns {string} Formatted export string
   * @throws {Error} If format is not supported
   * @example
   * const data = library.getCompetencies('Backend Developer', 'L3');
   * const json = library.export('json', data);
   * const markdown = library.export('markdown', data);
   */
  export(format, data) {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    if (format === 'markdown') {
      return this.toMarkdown(data);
    }
    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * Convert data to Markdown format.
   *
   * @param {Object} data - Data to convert
   * @returns {string} Markdown formatted string
   * @private
   * @example
   * const md = library.toMarkdown(competenciesData);
   */
  toMarkdown(data) {
    let md = '';

    if (data.role) {
      md += `# ${data.role}\n\n`;
    }
    if (data.level) {
      md += `## ${data.level}\n\n`;
    }
    if (data.core && Array.isArray(data.core)) {
      md += `### Core Competencies\n\n`;
      data.core.forEach(comp => {
        md += `- ${comp}\n`;
      });
      md += '\n';
    }
    if (data.complementary && Array.isArray(data.complementary)) {
      md += `### Complementary Competencies\n\n`;
      data.complementary.forEach(comp => {
        md += `- ${comp}\n`;
      });
      md += '\n';
    }

    return md;
  }
}

module.exports = TechRolesLibrary;
