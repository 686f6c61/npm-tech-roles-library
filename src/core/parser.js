/**
 * CSV Parser - Parses competency dictionary CSV file
 *
 * Reads and transforms the detailed competency CSV file into structured JavaScript objects.
 * Handles Spanish CSV format with specific column mappings.
 *
 * @module core/parser
 * @author 686f6c61
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * CSV Parser class for processing competency dictionary files.
 *
 * @class CSVParser
 */
class CSVParser {
  /**
   * Creates a new CSV parser instance.
   *
   * @param {string} csvPath - Absolute path to CSV file
   */
  constructor(csvPath) {
    this.csvPath = csvPath;
  }

  /**
   * Parse CSV file and return array of role entries.
   *
   * @returns {Object[]} Array of parsed role entries
   * @throws {Error} If file cannot be read or parsed
   */
  parse() {
    const fileContent = fs.readFileSync(this.csvPath, 'utf-8');

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      trim: true,
      relax_column_count: true
    });

    return records.map(record => this.transformRecord(record));
  }

  /**
   * Transform CSV record into structured entry object.
   *
   * @param {Object} record - Raw CSV record
   * @returns {Object} Transformed entry with parsed competencies
   * @private
   */
  transformRecord(record) {
    const level = record['Nivel'] || '';
    const levelNumber = this.extractLevelNumber(level);

    return {
      category: record['Categoría'] || '',
      role: record['Rol'] || '',
      level: level,
      code: record['Código'] || '',
      levelNumber: levelNumber,
      yearsRange: this.calculateYearsRange(levelNumber),
      coreCompetencies: this.parseCompetencies(record['Competencias Core']),
      complementaryCompetencies: this.parseCompetencies(record['Competencias Complementarias']),
      indicators: this.parseIndicators(record['Indicadores de Nivel'])
    };
  }

  /**
   * Parse semicolon-separated competencies string.
   *
   * @param {string} competencyString - Semicolon-separated competencies
   * @returns {string[]} Array of competency strings
   * @private
   */
  parseCompetencies(competencyString) {
    if (!competencyString) return [];
    return competencyString
      .split(';')
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }

  /**
   * Parse semicolon-separated indicators string.
   *
   * @param {string} indicatorString - Semicolon-separated indicators
   * @returns {string[]} Array of indicator strings
   * @private
   */
  parseIndicators(indicatorString) {
    if (!indicatorString) return [];
    return indicatorString
      .split(';')
      .map(i => i.trim())
      .filter(i => i.length > 0);
  }

  /**
   * Extract numeric level from level string (e.g., 'L3' -> 3).
   *
   * @param {string} levelString - Level string (e.g., 'L3 - Junior II')
   * @returns {number|null} Level number or null if not found
   * @private
   */
  extractLevelNumber(levelString) {
    if (!levelString) return null;
    const match = levelString.match(/L(\d)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Calculate years of experience range for a level.
   *
   * @param {number} levelNumber - Level number (1-9)
   * @returns {Object} Years range with min and max properties
   * @private
   */
  calculateYearsRange(levelNumber) {
    const ranges = {
      1: { min: 0, max: 1 },
      2: { min: 1, max: 2 },
      3: { min: 2, max: 4 },
      4: { min: 4, max: 6 },
      5: { min: 6, max: 8 },
      6: { min: 8, max: 12 },
      7: { min: 12, max: 15 },
      8: { min: 15, max: 20 },
      9: { min: 20, max: null }
    };
    return ranges[levelNumber] || { min: 0, max: null };
  }
}

module.exports = CSVParser;
