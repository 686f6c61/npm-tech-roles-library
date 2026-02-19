/**
 * Competency Database - In-memory database with optimized indexes
 *
 * Provides fast lookups through multiple indexes (by code, role, category, competency, level).
 * Uses Map data structures for O(1) lookups.
 *
 * @module core/database
 * @author 686f6c61
 */

/**
 * In-memory database for competency entries with multiple indexes.
 *
 * @class CompetencyDatabase
 */
class CompetencyDatabase {
  /**
   * Creates a new database instance with empty indexes.
   */
  constructor() {
    this.entries = [];
    this.indexes = {
      byCode: new Map(),          // code -> entry
      byRole: new Map(),          // roleName -> [entries]
      byCategory: new Map(),      // category -> [entries]
      byCompetency: new Map(),    // competency (lowercase) -> [entries]
      byLevelNumber: new Map()    // levelNumber -> [entries]
    };
  }

  /**
   * Load entries and build all indexes.
   *
   * @param {Object[]} entries - Array of parsed role entries
   */
  load(entries) {
    this.entries = entries;
    this.buildIndexes();
  }

  /**
   * Build all indexes from loaded entries.
   * Creates inverted indexes for fast lookups.
   *
   * @private
   */
  buildIndexes() {
    this.entries.forEach(entry => {
      // Index by code
      this.indexes.byCode.set(entry.code, entry);

      // Index by role
      if (!this.indexes.byRole.has(entry.role)) {
        this.indexes.byRole.set(entry.role, []);
      }
      this.indexes.byRole.get(entry.role).push(entry);

      // Index by category
      if (!this.indexes.byCategory.has(entry.category)) {
        this.indexes.byCategory.set(entry.category, []);
      }
      this.indexes.byCategory.get(entry.category).push(entry);

      // Index by competency (inverted index)
      const allCompetencies = [
        ...entry.coreCompetencies,
        ...entry.complementaryCompetencies
      ];
      allCompetencies.forEach(comp => {
        const compLower = comp.toLowerCase();
        if (!this.indexes.byCompetency.has(compLower)) {
          this.indexes.byCompetency.set(compLower, []);
        }
        this.indexes.byCompetency.get(compLower).push(entry);
      });

      // Index by level number
      if (entry.levelNumber) {
        if (!this.indexes.byLevelNumber.has(entry.levelNumber)) {
          this.indexes.byLevelNumber.set(entry.levelNumber, []);
        }
        this.indexes.byLevelNumber.get(entry.levelNumber).push(entry);
      }
    });

    // Sort role entries by level number
    this.indexes.byRole.forEach(entries => {
      entries.sort((a, b) => (a.levelNumber || 0) - (b.levelNumber || 0));
    });
  }

  /**
   * Get entry by code.
   *
   * @param {string} code - Role code (e.g., 'BE-L3')
   * @returns {Object|undefined} Entry or undefined if not found
   */
  getByCode(code) {
    return this.indexes.byCode.get(code);
  }

  /**
   * Get all entries for a role.
   *
   * @param {string} role - Role name
   * @returns {Object[]} Array of entries for this role
   */
  getByRole(role) {
    return this.indexes.byRole.get(role) || [];
  }

  /**
   * Get all entries in a category.
   *
   * @param {string} category - Category name
   * @returns {Object[]} Array of entries in this category
   */
  getByCategory(category) {
    return this.indexes.byCategory.get(category) || [];
  }

  /**
   * Search entries by competency.
   *
   * @param {string} competency - Competency to search for
   * @returns {Object[]} Array of entries containing this competency
   */
  searchByCompetency(competency) {
    const compLower = competency.toLowerCase();
    return this.indexes.byCompetency.get(compLower) || [];
  }

  /**
   * Get all unique role names.
   *
   * @returns {string[]} Array of role names
   */
  getAllRoles() {
    return Array.from(this.indexes.byRole.keys()).sort();
  }

  /**
   * Get all unique category names.
   *
   * @returns {string[]} Array of category names
   */
  getAllCategories() {
    return Array.from(this.indexes.byCategory.keys()).sort();
  }

  /**
   * Get database statistics.
   *
   * @returns {Object} Statistics object with counts and averages
   */
  getStatistics() {
    const allRoles = this.getAllRoles();
    const allCategories = this.getAllCategories();
    const byCategory = {};

    allCategories.forEach(category => {
      byCategory[category] = this.getByCategory(category).length;
    });

    return {
      totalRoles: allRoles.length,
      totalCategories: allCategories.length,
      totalEntries: this.entries.length,
      averageEntriesPerRole: allRoles.length > 0
        ? Math.round(this.entries.length / allRoles.length)
        : 0,
      byCategory
    };
  }
}

module.exports = CompetencyDatabase;
