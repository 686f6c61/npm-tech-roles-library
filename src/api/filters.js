/**
 * Filter API - Search and filtering utilities
 *
 * Provides methods for searching roles by name, category, and competencies.
 * Includes tokenization and scoring algorithms for relevant search results.
 *
 * @module api/filters
 * @author 686f6c61
 * @license MIT
 */

const { Validator } = require('../core/validator');

class FilterAPI {
  constructor(database) {
    this.db = database;
  }

  search(query, options = {}) {
    Validator.validateSearchQuery(query);

    const terms = this.tokenize(query.toLowerCase());
    const roleMap = new Map(); // Para evitar duplicados por nivel

    this.db.entries.forEach(entry => {
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
          matchedIn
        });
      }
    });

    const results = Array.from(roleMap.values())
      .sort((a, b) => b.matchScore - a.matchScore);

    const limit = options.limit || 20;
    return results.slice(0, limit);
  }

  searchByCompetency(competency) {
    Validator.validateSearchQuery(competency);

    const results = [];
    const compLower = competency.toLowerCase();

    this.db.entries.forEach(entry => {
      const allCompetencies = [
        ...entry.coreCompetencies,
        ...entry.complementaryCompetencies
      ];

      const matches = allCompetencies.filter(c =>
        c.toLowerCase().includes(compLower)
      );

      if (matches.length > 0) {
        results.push({
          entry: this.cloneEntry(entry),
          matches,
          matchCount: matches.length
        });
      }
    });

    return results.sort((a, b) => b.matchCount - a.matchCount);
  }

  findRolesWithCompetency(competency) {
    const results = this.searchByCompetency(competency);
    const roleMap = new Map();

    results.forEach(result => {
      const roleName = result.entry.role;
      if (!roleMap.has(roleName)) {
        roleMap.set(roleName, {
          role: roleName,
          category: result.entry.category,
          levels: [],
          totalMatches: 0
        });
      }

      const roleData = roleMap.get(roleName);
      roleData.levels.push({
        level: result.entry.level,
        code: result.entry.code,
        matches: result.matches
      });
      roleData.totalMatches += result.matchCount;
    });

    return Array.from(roleMap.values())
      .sort((a, b) => b.totalMatches - a.totalMatches);
  }

  buildSearchableText(entry) {
    return [
      entry.category,
      entry.role,
      entry.level,
      ...entry.coreCompetencies,
      ...entry.complementaryCompetencies,
      ...entry.indicators
    ].join(' ');
  }

  tokenize(text) {
    return text
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^\w]/g, ''));
  }

  cloneEntry(entry) {
    return {
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
  }
}

module.exports = FilterAPI;
