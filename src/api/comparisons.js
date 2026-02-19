/**
 * Comparison API - Role and level comparison utilities
 *
 * Provides methods for comparing roles, analyzing competency gaps, and finding similar roles.
 * Used internally by the main library for career progression analysis.
 *
 * @module api/comparisons
 * @author 686f6c61
 * @license MIT
 */

const { Validator } = require('../core/validator');

class ComparisonAPI {
  constructor(database, queryAPI) {
    this.db = database;
    this.queryAPI = queryAPI;
  }

  compareRoles(role1, role2, level) {
    const entry1 = this.queryAPI.getRoleByNameAndLevel(role1, level);
    const entry2 = this.queryAPI.getRoleByNameAndLevel(role2, level);

    const comp1Set = new Set([
      ...entry1.coreCompetencies,
      ...entry1.complementaryCompetencies
    ]);
    const comp2Set = new Set([
      ...entry2.coreCompetencies,
      ...entry2.complementaryCompetencies
    ]);

    const common = Array.from(comp1Set).filter(c => comp2Set.has(c));
    const unique1 = Array.from(comp1Set).filter(c => !comp2Set.has(c));
    const unique2 = Array.from(comp2Set).filter(c => !comp1Set.has(c));

    const unionSize = comp1Set.size + comp2Set.size - common.length;
    const similarity = unionSize > 0 ? common.length / unionSize : 0;

    return {
      role1: {
        name: entry1.role,
        level: entry1.level,
        code: entry1.code
      },
      role2: {
        name: entry2.role,
        level: entry2.level,
        code: entry2.code
      },
      common,
      unique1,
      unique2,
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
    const from = this.queryAPI.getRoleByNameAndLevel(roleName, fromLevel);
    const to = this.queryAPI.getRoleByNameAndLevel(roleName, toLevel);

    const fromSet = new Set([
      ...from.coreCompetencies,
      ...from.complementaryCompetencies
    ]);
    const toSet = new Set([
      ...to.coreCompetencies,
      ...to.complementaryCompetencies
    ]);

    const maintained = Array.from(fromSet).filter(c => toSet.has(c));
    const newCompetencies = Array.from(toSet).filter(c => !fromSet.has(c));
    const deprecated = Array.from(fromSet).filter(c => !toSet.has(c));

    return {
      role: roleName,
      fromLevel: {
        level: from.level,
        code: from.code,
        yearsRange: from.yearsRange
      },
      toLevel: {
        level: to.level,
        code: to.code,
        yearsRange: to.yearsRange
      },
      maintained,
      new: newCompetencies,
      deprecated,
      statistics: {
        maintainedCount: maintained.length,
        newCount: newCompetencies.length,
        deprecatedCount: deprecated.length,
        growthRate: fromSet.size > 0
          ? Math.round((newCompetencies.length / fromSet.size) * 100)
          : 0
      }
    };
  }

  findSimilarRoles(roleName, threshold = 0.3) {
    Validator.validateRoleName(roleName);

    const targetLevels = this.queryAPI.getAllLevelsForRole(roleName);
    const targetCompetencies = new Set();

    targetLevels.forEach(level => {
      level.coreCompetencies.forEach(c => targetCompetencies.add(c));
      level.complementaryCompetencies.forEach(c => targetCompetencies.add(c));
    });

    const allRoles = this.db.getAllRoles();
    const similarities = [];

    allRoles.forEach(role => {
      if (role === roleName) return;

      const roleLevels = this.queryAPI.getAllLevelsForRole(role);
      const roleCompetencies = new Set();

      roleLevels.forEach(level => {
        level.coreCompetencies.forEach(c => roleCompetencies.add(c));
        level.complementaryCompetencies.forEach(c => roleCompetencies.add(c));
      });

      const intersection = new Set(
        [...targetCompetencies].filter(c => roleCompetencies.has(c))
      );
      const union = new Set([...targetCompetencies, ...roleCompetencies]);
      const similarity = intersection.size / union.size;

      if (similarity >= threshold) {
        const commonCompetencies = Array.from(intersection);
        similarities.push({
          role,
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
      },
      recommendations: this.generateRecommendations(comparison.new)
    };
  }

  generateRecommendations(newCompetencies) {
    const categories = {
      technical: [],
      leadership: [],
      architecture: [],
      processes: []
    };

    const leadershipKeywords = ['liderazgo', 'leadership', 'gestión', 'management', 'mentor'];
    const architectureKeywords = ['arquitectura', 'architecture', 'diseño', 'design', 'estrategia', 'strategy'];
    const processKeywords = ['proceso', 'process', 'metodología', 'methodology', 'governance'];

    newCompetencies.forEach(comp => {
      const compLower = comp.toLowerCase();
      let categorized = false;

      if (leadershipKeywords.some(k => compLower.includes(k))) {
        categories.leadership.push(comp);
        categorized = true;
      }
      if (architectureKeywords.some(k => compLower.includes(k))) {
        categories.architecture.push(comp);
        categorized = true;
      }
      if (processKeywords.some(k => compLower.includes(k))) {
        categories.processes.push(comp);
        categorized = true;
      }
      if (!categorized) {
        categories.technical.push(comp);
      }
    });

    return categories;
  }

  getCareerPath(roleName, fromLevel, toLevel) {
    Validator.validateRoleName(roleName);

    const allLevels = this.queryAPI.getAllLevelsForRole(roleName);
    const normalizedFrom = Validator.normalizeLevel(fromLevel);
    const normalizedTo = Validator.normalizeLevel(toLevel);

    const fromNum = parseInt(normalizedFrom.match(/\d/)[0]);
    const toNum = parseInt(normalizedTo.match(/\d/)[0]);

    if (fromNum >= toNum) {
      throw new Error('Target level must be higher than starting level');
    }

    const path = [];
    for (let i = fromNum; i <= toNum; i++) {
      const level = allLevels.find(l => l.levelNumber === i);
      if (level) {
        const stepData = {
          level: level.level,
          code: level.code,
          yearsRange: level.yearsRange,
          indicators: level.indicators
        };

        if (i > fromNum) {
          const prevLevel = allLevels.find(l => l.levelNumber === i - 1);
          if (prevLevel) {
            const comparison = this.compareLevels(roleName, prevLevel.level, level.level);
            stepData.newCompetencies = comparison.new;
            stepData.newCompetenciesCount = comparison.new.length;
          }
        }

        path.push(stepData);
      }
    }

    return {
      role: roleName,
      from: normalizedFrom,
      to: normalizedTo,
      steps: path,
      totalSteps: path.length,
      estimatedYears: path.length > 0
        ? (path[path.length - 1].yearsRange.min - (path[0].yearsRange.min || 0))
        : 0
    };
  }

}

module.exports = ComparisonAPI;
