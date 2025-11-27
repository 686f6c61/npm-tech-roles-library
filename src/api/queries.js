/**
 * Query API - Core data access layer
 *
 * Provides the main API for querying roles, levels, and competencies.
 * Includes support for accumulated competencies, career paths, and experience-based lookups.
 *
 * @module api/queries
 * @author 686f6c61
 * @license MIT
 */

const { Validator, RoleNotFoundError, LevelNotFoundError } = require('../core/validator');

class QueryAPI {
  constructor(database, translator = null) {
    this.db = database;
    this.translator = translator;
  }

  getRoles() {
    return this.db.getAllRoles();
  }

  getCategories() {
    return this.db.getAllCategories();
  }

  getRoleByCode(code) {
    const entry = this.db.getByCode(code);
    if (!entry) {
      throw new RoleNotFoundError(code);
    }
    return this.cloneEntry(entry);
  }

  getRoleByNameAndLevel(roleName, level) {
    Validator.validateRoleName(roleName);
    Validator.validateLevel(level);

    const normalizedLevel = Validator.normalizeLevel(level);
    const entries = this.db.getByRole(roleName);

    if (entries.length === 0) {
      throw new RoleNotFoundError(roleName);
    }

    const found = entries.find(e => e.level.includes(normalizedLevel));
    if (!found) {
      throw new LevelNotFoundError(roleName, level);
    }

    return this.cloneEntry(found);
  }

  getAllLevelsForRole(roleName) {
    Validator.validateRoleName(roleName);

    const entries = this.db.getByRole(roleName);
    if (entries.length === 0) {
      throw new RoleNotFoundError(roleName);
    }

    return entries.map(e => this.cloneEntry(e));
  }

  getCompetencies(roleName, level, options = {}) {
    const entry = this.getRoleByNameAndLevel(roleName, level);

    const result = {
      role: entry.role,
      level: entry.level,
      code: entry.code,
      yearsRange: entry.yearsRange,
      core: entry.coreCompetencies
    };

    if (options.includeComplementary !== false) {
      result.complementary = entry.complementaryCompetencies;
    }

    if (options.includeIndicators !== false) {
      result.indicators = entry.indicators;
    }

    return result;
  }

  getAccumulatedCompetencies(roleName, targetLevel) {
    Validator.validateRoleName(roleName);
    Validator.validateLevel(targetLevel);

    const allLevels = this.getAllLevelsForRole(roleName);
    const normalizedLevel = Validator.normalizeLevel(targetLevel);
    const targetLevelNum = parseInt(normalizedLevel.match(/\d/)[0]);

    const accumulated = {
      role: roleName,
      targetLevel: normalizedLevel,
      levels: []
    };

    for (let i = 1; i <= targetLevelNum; i++) {
      const level = allLevels.find(l => l.levelNumber === i);
      if (level) {
        accumulated.levels.push({
          level: level.level,
          code: level.code,
          yearsRange: level.yearsRange,
          coreCompetencies: [...level.coreCompetencies],
          complementaryCompetencies: [...level.complementaryCompetencies],
          indicators: [...level.indicators]
        });
      }
    }

    return accumulated;
  }

  getByExperience(roleName, years) {
    Validator.validateRoleName(roleName);

    if (typeof years !== 'number' || years < 0) {
      throw new Error('Years must be a positive number');
    }

    const allLevels = this.getAllLevelsForRole(roleName);

    for (const level of allLevels) {
      const range = level.yearsRange;
      if (range.max === null && years >= range.min) {
        return this.cloneEntry(level);
      }
      if (years >= range.min && years <= range.max) {
        return this.cloneEntry(level);
      }
    }

    return this.cloneEntry(allLevels[allLevels.length - 1]);
  }

  /**
   * Get complete career path view (mastered + current + growth)
   * Perfect for HR, career planning, and skill gap analysis
   */
  getCareerPathComplete(roleName, currentLevel) {
    Validator.validateRoleName(roleName);
    Validator.validateLevel(currentLevel);

    const allLevels = this.getAllLevelsForRole(roleName);
    const normalizedLevel = Validator.normalizeLevel(currentLevel);
    const currentLevelNum = parseInt(normalizedLevel.match(/\d/)[0]);

    // Find current level details
    const currentLevelData = allLevels.find(l => l.levelNumber === currentLevelNum);
    if (!currentLevelData) {
      throw new Error(`Level ${currentLevel} not found for role ${roleName}`);
    }

    // Split into mastered (L1 to L(n-1)), current (Ln), and growth (L(n+1) to L9)
    const masteredLevels = [];
    const growthPath = [];

    allLevels.forEach(level => {
      if (level.levelNumber < currentLevelNum) {
        masteredLevels.push({
          level: level.level,
          code: level.code,
          levelNumber: level.levelNumber,
          yearsRange: level.yearsRange,
          coreCompetencies: [...level.coreCompetencies],
          complementaryCompetencies: [...level.complementaryCompetencies],
          indicators: [...level.indicators]
        });
      } else if (level.levelNumber > currentLevelNum) {
        growthPath.push({
          level: level.level,
          code: level.code,
          levelNumber: level.levelNumber,
          yearsRange: level.yearsRange,
          coreCompetencies: [...level.coreCompetencies],
          complementaryCompetencies: [...level.complementaryCompetencies],
          indicators: [...level.indicators]
        });
      }
    });

    // Calculate statistics
    const countCompetencies = (levels) => {
      return levels.reduce((acc, level) => ({
        core: acc.core + level.coreCompetencies.length,
        complementary: acc.complementary + level.complementaryCompetencies.length,
        indicators: acc.indicators + level.indicators.length
      }), { core: 0, complementary: 0, indicators: 0 });
    };

    const masteredStats = countCompetencies(masteredLevels);
    const currentStats = {
      core: currentLevelData.coreCompetencies.length,
      complementary: currentLevelData.complementaryCompetencies.length,
      indicators: currentLevelData.indicators.length
    };
    const growthStats = countCompetencies(growthPath);

    const totalMastered = masteredStats.core + masteredStats.complementary + masteredStats.indicators;
    const totalCurrent = currentStats.core + currentStats.complementary + currentStats.indicators;
    const totalRemaining = growthStats.core + growthStats.complementary + growthStats.indicators;
    const totalAll = totalMastered + totalCurrent + totalRemaining;

    return {
      role: currentLevelData.role,
      currentLevel: {
        level: currentLevelData.level,
        code: currentLevelData.code,
        levelNumber: currentLevelData.levelNumber,
        yearsRange: currentLevelData.yearsRange,
        coreCompetencies: [...currentLevelData.coreCompetencies],
        complementaryCompetencies: [...currentLevelData.complementaryCompetencies],
        indicators: [...currentLevelData.indicators]
      },
      masteredLevels: masteredLevels,
      growthPath: growthPath,
      summary: {
        totalMasteredCompetencies: totalMastered,
        currentLevelCompetencies: totalCurrent,
        remainingToLearn: totalRemaining,
        progressPercentage: totalAll > 0 ? Math.round((totalMastered + totalCurrent) / totalAll * 100) : 0,
        masteredStats: masteredStats,
        currentStats: currentStats,
        growthStats: growthStats
      }
    };
  }

  filterByCategory(category) {
    const entries = this.db.getByCategory(category);
    return entries.map(e => this.cloneEntry(e));
  }

  filterByLevel(levelNumber) {
    if (typeof levelNumber !== 'number' || levelNumber < 1 || levelNumber > 9) {
      throw new Error('Level number must be between 1 and 9');
    }

    const entries = this.db.indexes.byLevelNumber.get(levelNumber) || [];
    return entries.map(e => this.cloneEntry(e));
  }

  /**
   * Get all roles with complete metadata
   * Returns a comprehensive catalog of all 78 roles with level counts and categories
   * Perfect for displaying role catalogs, navigation, and overview dashboards
   */
  getAllRolesWithMetadata() {
    const allRoleNames = this.db.getAllRoles();
    const categories = this.db.getAllCategories();

    const rolesWithMetadata = allRoleNames.map(roleName => {
      const levels = this.db.getByRole(roleName);

      if (levels.length === 0) {
        return null;
      }

      // Get the first entry for basic metadata
      const firstLevel = levels[0];

      // Calculate total competencies across all levels
      let totalCoreCompetencies = 0;
      let totalComplementaryCompetencies = 0;
      let totalIndicators = 0;

      levels.forEach(level => {
        totalCoreCompetencies += level.coreCompetencies.length;
        totalComplementaryCompetencies += level.complementaryCompetencies.length;
        totalIndicators += level.indicators.length;
      });

      // Get available levels and their codes
      const availableLevels = levels.map(level => ({
        level: level.level,
        code: level.code,
        levelNumber: level.levelNumber,
        yearsRange: { ...level.yearsRange },
        competenciesCount: level.coreCompetencies.length + level.complementaryCompetencies.length,
        indicatorsCount: level.indicators.length
      })).sort((a, b) => a.levelNumber - b.levelNumber);

      // Calculate years range across all levels
      const minYears = Math.min(...levels.map(l => l.yearsRange.min));
      const maxYears = Math.max(...levels.map(l => l.yearsRange.max === null ? 99 : l.yearsRange.max));

      // Translate role name if translator is available
      const translatedRoleName = this.translator
        ? this.translator.translateRoleName(roleName)
        : roleName;

      return {
        role: translatedRoleName,
        originalRole: roleName, // Keep original for queries
        category: firstLevel.category,
        availableLevels: availableLevels,
        levelCount: levels.length,
        yearsRange: {
          min: minYears,
          max: maxYears === 99 ? null : maxYears
        },
        statistics: {
          totalCoreCompetencies: totalCoreCompetencies,
          totalComplementaryCompetencies: totalComplementaryCompetencies,
          totalIndicators: totalIndicators,
          totalCompetencies: totalCoreCompetencies + totalComplementaryCompetencies + totalIndicators,
          avgCompetenciesPerLevel: Math.round((totalCoreCompetencies + totalComplementaryCompetencies) / levels.length)
        }
      };
    }).filter(role => role !== null);

    // Group by category
    const byCategory = {};
    categories.forEach(category => {
      byCategory[category] = rolesWithMetadata.filter(r => r.category === category);
    });

    return {
      roles: rolesWithMetadata.sort((a, b) => a.originalRole.localeCompare(b.originalRole)),
      byCategory: byCategory,
      summary: {
        totalRoles: rolesWithMetadata.length,
        totalCategories: categories.length,
        categories: categories,
        totalLevels: rolesWithMetadata.reduce((sum, role) => sum + role.levelCount, 0)
      }
    };
  }

  cloneEntry(entry) {
    const cloned = {
      category: entry.category,
      role: entry.role,
      level: entry.level,
      code: entry.code,
      levelNumber: entry.levelNumber,
      yearsRange: { ...entry.yearsRange },
      coreCompetencies: [...entry.coreCompetencies],
      complementaryCompetencies: [...entry.complementaryCompetencies],
      indicators: [...entry.indicators]
    };

    // Translate if translator is available
    if (this.translator) {
      return this.translator.translate(cloned);
    }

    return cloned;
  }
}

module.exports = QueryAPI;
