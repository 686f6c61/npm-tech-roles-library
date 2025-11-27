/**
 * Tech Roles Library - Browser Bundle
 * Complete library functionality for browser environments
 *
 * @version 1.0.0
 * @author 686f6c61
 * @license MIT
 */

(function(window) {
  'use strict';

  // ========================================
  // VALIDATOR
  // ========================================
  class Validator {
    static validateRoleName(name) {
      if (typeof name !== 'string') {
        throw new Error('Role name must be a string');
      }
      if (name.length === 0) {
        throw new Error('Role name cannot be empty');
      }
      return name.trim();
    }

    static validateLevel(level) {
      if (typeof level !== 'string' && typeof level !== 'number') {
        throw new Error('Level must be a string or number');
      }
      const levelStr = String(level);
      if (!/^L?[1-9]/.test(levelStr)) {
        throw new Error('Invalid level format. Expected L1-L9 or 1-9');
      }
      return levelStr;
    }

    static normalizeLevel(level) {
      const levelStr = String(level);
      if (/^[1-9]$/.test(levelStr)) {
        return `L${levelStr}`;
      }
      return levelStr;
    }
  }

  // ========================================
  // COMPARISON API
  // ========================================
  class ComparisonAPI {
    constructor(database) {
      this.db = database;
    }

    compareRoles(role1, role2, level) {
      const entry1 = this.db.getRoleByNameAndLevel(role1, level);
      const entry2 = this.db.getRoleByNameAndLevel(role2, level);

      const comp1Set = new Set([...entry1.coreCompetencies, ...entry1.complementaryCompetencies]);
      const comp2Set = new Set([...entry2.coreCompetencies, ...entry2.complementaryCompetencies]);

      const common = Array.from(comp1Set).filter(c => comp2Set.has(c));
      const unique1 = Array.from(comp1Set).filter(c => !comp2Set.has(c));
      const unique2 = Array.from(comp2Set).filter(c => !comp1Set.has(c));

      const unionSize = comp1Set.size + comp2Set.size - common.length;
      const similarity = unionSize > 0 ? common.length / unionSize : 0;

      return {
        role1: { name: entry1.role, level: entry1.level, code: entry1.code },
        role2: { name: entry2.role, level: entry2.level, code: entry2.code },
        common: common,
        unique1: unique1,
        unique2: unique2,
        similarity: Math.round(similarity * 1000) / 1000,
        statistics: {
          totalCompetencies1: comp1Set.size,
          totalCompetencies2: comp2Set.size,
          commonCount: common.length,
          unique1Count: unique1.length,
          unique2Count: unique2.length
        }
      };
    }

    compareLevels(roleName, fromLevel, toLevel) {
      const from = this.db.getRoleByNameAndLevel(roleName, fromLevel);
      const to = this.db.getRoleByNameAndLevel(roleName, toLevel);

      const fromSet = new Set([...from.coreCompetencies, ...from.complementaryCompetencies]);
      const toSet = new Set([...to.coreCompetencies, ...to.complementaryCompetencies]);

      const maintained = Array.from(fromSet).filter(c => toSet.has(c));
      const newCompetencies = Array.from(toSet).filter(c => !fromSet.has(c));
      const deprecated = Array.from(fromSet).filter(c => !toSet.has(c));

      return {
        role: roleName,
        fromLevel: { level: from.level, code: from.code, yearsRange: from.yearsRange },
        toLevel: { level: to.level, code: to.code, yearsRange: to.yearsRange },
        maintained: maintained,
        new: newCompetencies,
        deprecated: deprecated,
        statistics: {
          maintainedCount: maintained.length,
          newCount: newCompetencies.length,
          deprecatedCount: deprecated.length,
          growthRate: fromSet.size > 0 ? Math.round((newCompetencies.length / fromSet.size) * 100) : 0
        }
      };
    }

    findSimilarRoles(roleName, threshold = 0.3) {
      const targetLevels = this.db.getAllLevelsForRole(roleName);
      const targetCompetencies = new Set();

      targetLevels.forEach(level => {
        level.coreCompetencies.forEach(c => targetCompetencies.add(c));
        level.complementaryCompetencies.forEach(c => targetCompetencies.add(c));
      });

      const allRoles = this.db.getAllRoles();
      const similarities = [];

      allRoles.forEach(role => {
        if (role === roleName) return;

        const roleLevels = this.db.getAllLevelsForRole(role);
        const roleCompetencies = new Set();

        roleLevels.forEach(level => {
          level.coreCompetencies.forEach(c => roleCompetencies.add(c));
          level.complementaryCompetencies.forEach(c => roleCompetencies.add(c));
        });

        const intersection = new Set([...targetCompetencies].filter(c => roleCompetencies.has(c)));
        const union = new Set([...targetCompetencies, ...roleCompetencies]);
        const similarity = intersection.size / union.size;

        if (similarity >= threshold) {
          const commonCompetencies = Array.from(intersection);
          similarities.push({
            role: role,
            category: roleLevels[0].category,
            similarity: Math.round(similarity * 1000) / 1000,
            commonCompetencies: commonCompetencies.slice(0, 10),
            totalCommon: commonCompetencies.length
          });
        }
      });

      return similarities.sort((a, b) => b.similarity - a.similarity);
    }

    getCompetencyGaps(roleName, fromLevel, toLevel) {
      const comparison = this.compareLevels(roleName, fromLevel, toLevel);
      const estimatedWeeks = comparison.new.length * 2;
      const estimatedMonths = Math.ceil(estimatedWeeks / 4);

      return {
        role: roleName,
        from: comparison.fromLevel,
        to: comparison.toLevel,
        gaps: comparison.new,
        gapCount: comparison.new.length,
        estimatedLearningTime: {
          weeks: estimatedWeeks,
          months: estimatedMonths
        }
      };
    }
  }

  // ========================================
  // DATABASE
  // ========================================
  class Database {
    constructor(entries) {
      this.entries = entries;
      this.indexes = {
        byCode: new Map(),
        byRole: new Map(),
        byCategory: new Map(),
        byLevelNumber: new Map()
      };
      this.buildIndexes();
    }

    buildIndexes() {
      this.entries.forEach(entry => {
        this.indexes.byCode.set(entry.code, entry);

        if (!this.indexes.byRole.has(entry.role)) {
          this.indexes.byRole.set(entry.role, []);
        }
        this.indexes.byRole.get(entry.role).push(entry);

        if (!this.indexes.byCategory.has(entry.category)) {
          this.indexes.byCategory.set(entry.category, []);
        }
        this.indexes.byCategory.get(entry.category).push(entry);

        if (entry.levelNumber) {
          if (!this.indexes.byLevelNumber.has(entry.levelNumber)) {
            this.indexes.byLevelNumber.set(entry.levelNumber, []);
          }
          this.indexes.byLevelNumber.get(entry.levelNumber).push(entry);
        }
      });

      this.indexes.byRole.forEach((entries, role) => {
        entries.sort((a, b) => (a.levelNumber || 0) - (b.levelNumber || 0));
      });
    }

    getByCode(code) {
      return this.indexes.byCode.get(code);
    }

    getByRole(role) {
      return this.indexes.byRole.get(role) || [];
    }

    getAllRoles() {
      return Array.from(this.indexes.byRole.keys()).sort();
    }

    getAllCategories() {
      return Array.from(this.indexes.byCategory.keys()).sort();
    }

    getRoleByNameAndLevel(roleName, level) {
      const normalizedLevel = Validator.normalizeLevel(level);
      const entries = this.getByRole(roleName);

      if (entries.length === 0) {
        throw new Error(`Role "${roleName}" not found`);
      }

      const found = entries.find(e => e.level.includes(normalizedLevel));
      if (!found) {
        throw new Error(`Level "${level}" not found for role "${roleName}"`);
      }

      return { ...found };
    }

    getAllLevelsForRole(roleName) {
      const entries = this.getByRole(roleName);
      if (entries.length === 0) {
        throw new Error(`Role "${roleName}" not found`);
      }
      return entries.map(e => ({ ...e }));
    }

    getByExperience(roleName, years) {
      const allLevels = this.getAllLevelsForRole(roleName);

      for (const level of allLevels) {
        const range = level.yearsRange;
        if (range.max === null && years >= range.min) {
          return { ...level };
        }
        if (years >= range.min && years <= range.max) {
          return { ...level };
        }
      }

      return { ...allLevels[allLevels.length - 1] };
    }

    getCareerPathComplete(roleName, currentLevel) {
      const allLevels = this.getAllLevelsForRole(roleName);
      const normalizedLevel = Validator.normalizeLevel(currentLevel);
      const currentLevelNum = parseInt(normalizedLevel.match(/\d/)[0]);

      const currentLevelData = allLevels.find(l => l.levelNumber === currentLevelNum);
      if (!currentLevelData) {
        throw new Error(`Level ${currentLevel} not found for role ${roleName}`);
      }

      const masteredLevels = [];
      const growthPath = [];

      allLevels.forEach(level => {
        if (level.levelNumber < currentLevelNum) {
          masteredLevels.push({ ...level });
        } else if (level.levelNumber > currentLevelNum) {
          growthPath.push({ ...level });
        }
      });

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
        currentLevel: { ...currentLevelData },
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

    search(query, options = {}) {
      const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 2);
      const roleMap = new Map(); // Para evitar duplicados por nivel

      this.entries.forEach(entry => {
        let score = 0;
        let matchedIn = '';

        terms.forEach(term => {
          if (entry.role.toLowerCase().includes(term)) {
            score += 10;
            matchedIn = 'role';
          }
          if (entry.category.toLowerCase().includes(term)) {
            score += 5;
            if (matchedIn) matchedIn = 'both';
            else matchedIn = 'category';
          }
        });

        if (score > 0 && !roleMap.has(entry.role)) {
          roleMap.set(entry.role, {
            role: entry.role,
            category: entry.category,
            matchScore: score,
            matchedIn: matchedIn
          });
        }
      });

      const results = Array.from(roleMap.values())
        .sort((a, b) => b.matchScore - a.matchScore);

      const limit = options.limit || 20;
      return results.slice(0, limit);
    }
  }

  // ========================================
  // TECH ROLES LIBRARY
  // ========================================
  class TechRolesLibrary {
    constructor(language = 'es') {
      this.language = language;
      this.database = null;
      this.comparisonAPI = null;
      this.loaded = false;
    }

    async init() {
      if (this.loaded) return;

      try {
        const response = await fetch('bundle-data.json');
        const data = await response.json();

        const entries = this.language === 'en' ? data.entriesEN : data.entriesES;
        this.database = new Database(entries);
        this.comparisonAPI = new ComparisonAPI(this.database);
        this.catalogData = this.language === 'en' ? data.catalogEN : data.catalogES;

        // Generate statistics from data
        const categoryCount = {};
        entries.forEach(entry => {
          categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1;
        });

        this.statisticsData = {
          totalRoles: data.catalogEN ? data.catalogEN.roles.length : 78,
          totalEntries: entries.length,
          totalCategories: Object.keys(categoryCount).length,
          byCategory: categoryCount,
          categories: Object.keys(categoryCount).sort()
        };

        this.loaded = true;
        console.log('✓ Tech Roles Library loaded:', entries.length, 'entries');
      } catch (error) {
        console.error('Failed to initialize library:', error);
        throw error;
      }
    }

    getRoles() {
      return this.database.getAllRoles();
    }

    getCategories() {
      return this.database.getAllCategories();
    }

    getRole(code) {
      return this.database.getByCode(code);
    }

    getRoleByName(name, level) {
      return this.database.getRoleByNameAndLevel(name, level);
    }

    getLevelsForRole(roleName) {
      return this.database.getAllLevelsForRole(roleName);
    }

    getCompetencies(roleName, level) {
      return this.database.getRoleByNameAndLevel(roleName, level);
    }

    getByExperience(roleName, years) {
      return this.database.getByExperience(roleName, years);
    }

    getCareerPathComplete(roleName, currentLevel) {
      return this.database.getCareerPathComplete(roleName, currentLevel);
    }

    getNextLevel(role, currentLevel) {
      const normalizedLevel = Validator.normalizeLevel(currentLevel);
      const currentNum = parseInt(normalizedLevel.match(/\d/)[0]);

      if (currentNum >= 9) {
        return null;
      }

      const nextNum = currentNum + 1;
      const nextLevel = this.database.getRoleByNameAndLevel(role, `L${nextNum}`);
      const comparison = this.comparisonAPI.compareLevels(role, normalizedLevel, nextLevel.level);

      return {
        current: {
          level: normalizedLevel,
          yearsRange: this.database.getRoleByNameAndLevel(role, normalizedLevel).yearsRange
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

    search(query, options = {}) {
      return this.database.search(query, options);
    }

    getAllRolesWithMetadata() {
      return this.catalogData;
    }

    getStatistics() {
      return this.statisticsData;
    }
  }

  // Expose to window
  window.TechRolesLibrary = TechRolesLibrary;

})(window);
