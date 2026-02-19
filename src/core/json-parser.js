/**
 * JSON Parser - Parses role JSON files
 *
 * Reads and transforms JSON role files into structured database entries.
 * Replaces the CSV parser with a JSON-based approach.
 *
 * @module core/json-parser
 * @author 686f6c61
 * @license MIT
 */

const fs = require('fs');
const path = require('path');

/**
 * JSON Parser class for processing role definition files.
 *
 * @class JSONParser
 */
class JSONParser {
  /**
   * Creates a new JSON parser instance.
   *
   * @param {string} translationsDir - Path to translations directory (es/ or en/)
   */
  constructor(translationsDir) {
    this.translationsDir = translationsDir;
  }

  /**
   * Parse all JSON files in the translations directory.
   *
   * @returns {Array} Array of role entries
   */
  parse() {
    const entries = [];

    try {
      // Get all JSON files in directory
      const files = fs.readdirSync(this.translationsDir)
        .filter(f => f.endsWith('.json'))
        .sort();

      // Process each file
      files.forEach(filename => {
        const filePath = path.join(this.translationsDir, filename);
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Extract role metadata
        const role = fileData.role;
        const category = fileData.category;

        // Process each level
        Object.entries(fileData.levels).forEach(([code, levelData]) => {
          entries.push({
            category,
            role,
            level: levelData.level,
            code,
            levelNumber: levelData.levelNumber,
            yearsRange: levelData.yearsRange,
            coreCompetencies: levelData.coreCompetencies || [],
            complementaryCompetencies: levelData.complementaryCompetencies || [],
            indicators: levelData.indicators || []
          });
        });
      });

      return entries;

    } catch (error) {
      throw new Error(`Failed to parse JSON files: ${error.message}`);
    }
  }
}

module.exports = JSONParser;
