const fs = require('fs');
const path = require('path');

// Paths
const EN_DIR = path.join(__dirname, '../../src/i18n/translations/en');
const ES_DIR = path.join(__dirname, '../../src/i18n/translations/es');

// Get all JSON files
const getJsonFiles = (dir) => {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort();
};

// Read and parse JSON file
const readJson = (dir, file) => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  return JSON.parse(content);
};

// Validation functions
const validateStructure = (data, lang, filename) => {
  const errors = [];
  const levels = Object.keys(data);

  if (levels.length === 0) {
    errors.push(`${lang}/${filename}: No levels found`);
    return errors;
  }

  levels.forEach(levelCode => {
    const level = data[levelCode];

    // Check required fields exist
    if (!level.coreCompetencies) {
      errors.push(`${lang}/${filename} [${levelCode}]: Missing coreCompetencies`);
    }
    if (!level.complementaryCompetencies) {
      errors.push(`${lang}/${filename} [${levelCode}]: Missing complementaryCompetencies`);
    }
    if (!level.indicators) {
      errors.push(`${lang}/${filename} [${levelCode}]: Missing indicators`);
    }

    // Check they are arrays
    if (level.coreCompetencies && !Array.isArray(level.coreCompetencies)) {
      errors.push(`${lang}/${filename} [${levelCode}]: coreCompetencies is not an array`);
    }
    if (level.complementaryCompetencies && !Array.isArray(level.complementaryCompetencies)) {
      errors.push(`${lang}/${filename} [${levelCode}]: complementaryCompetencies is not an array`);
    }
    if (level.indicators && !Array.isArray(level.indicators)) {
      errors.push(`${lang}/${filename} [${levelCode}]: indicators is not an array`);
    }

    // Check minimum items
    if (level.coreCompetencies && level.coreCompetencies.length < 5) {
      errors.push(`${lang}/${filename} [${levelCode}]: coreCompetencies has less than 5 items (${level.coreCompetencies.length})`);
    }
    if (level.complementaryCompetencies && level.complementaryCompetencies.length < 2) {
      errors.push(`${lang}/${filename} [${levelCode}]: complementaryCompetencies has less than 2 items (${level.complementaryCompetencies.length})`);
    }
    if (level.indicators && level.indicators.length < 2) {
      errors.push(`${lang}/${filename} [${levelCode}]: indicators has less than 2 items (${level.indicators.length})`);
    }

    // Check no empty strings
    const checkEmptyStrings = (arr, field) => {
      if (!arr) return;
      arr.forEach((item, idx) => {
        if (typeof item !== 'string' || item.trim().length === 0) {
          errors.push(`${lang}/${filename} [${levelCode}]: ${field}[${idx}] is empty or not a string`);
        }
      });
    };

    checkEmptyStrings(level.coreCompetencies, 'coreCompetencies');
    checkEmptyStrings(level.complementaryCompetencies, 'complementaryCompetencies');
    checkEmptyStrings(level.indicators, 'indicators');
  });

  return errors;
};

// Compare EN and ES to ensure they're different (actual translations)
const compareTranslations = (enData, esData, filename) => {
  const errors = [];
  const enLevels = Object.keys(enData);
  const esLevels = Object.keys(esData);

  // Check same number of levels
  if (enLevels.length !== esLevels.length) {
    errors.push(`${filename}: Different number of levels (EN: ${enLevels.length}, ES: ${esLevels.length})`);
  }

  // Check level codes match
  const missingInES = enLevels.filter(l => !esLevels.includes(l));
  const missingInEN = esLevels.filter(l => !enLevels.includes(l));

  if (missingInES.length > 0) {
    errors.push(`${filename}: Levels missing in ES: ${missingInES.join(', ')}`);
  }
  if (missingInEN.length > 0) {
    errors.push(`${filename}: Levels missing in EN: ${missingInEN.join(', ')}`);
  }

  // Check translations are different (not identical)
  enLevels.forEach(levelCode => {
    if (!esData[levelCode]) return;

    const enLevel = enData[levelCode];
    const esLevel = esData[levelCode];

    // Sample check: first core competency should be different
    if (enLevel.coreCompetencies && esLevel.coreCompetencies &&
        enLevel.coreCompetencies.length > 0 && esLevel.coreCompetencies.length > 0) {
      if (enLevel.coreCompetencies[0] === esLevel.coreCompetencies[0]) {
        errors.push(`${filename} [${levelCode}]: EN and ES first coreCompetency are identical (not translated)`);
      }
    }
  });

  return errors;
};

// Main validation
describe('Translation Validation', () => {
  let enFiles, esFiles;

  beforeAll(() => {
    enFiles = getJsonFiles(EN_DIR);
    esFiles = getJsonFiles(ES_DIR);
  });

  test('Should have same number of files in EN and ES', () => {
    expect(enFiles.length).toBe(esFiles.length);
    expect(enFiles.length).toBe(78); // Total expected roles
  });

  test('All EN files should exist in ES', () => {
    const missingInES = enFiles.filter(f => !esFiles.includes(f));
    expect(missingInES).toEqual([]);
  });

  test('All ES files should exist in EN', () => {
    const missingInEN = esFiles.filter(f => !enFiles.includes(f));
    expect(missingInEN).toEqual([]);
  });

  describe('File Structure Validation', () => {
    const allErrors = [];

    test('All EN files have valid JSON structure', () => {
      enFiles.forEach(file => {
        try {
          const data = readJson(EN_DIR, file);
          const errors = validateStructure(data.levels || data, 'en', file);
          if (errors.length > 0) {
            allErrors.push(...errors);
          }
        } catch (e) {
          allErrors.push(`en/${file}: Invalid JSON - ${e.message}`);
        }
      });

      if (allErrors.length > 0) {
        console.log('\nEN Validation Errors:\n' + allErrors.join('\n'));
      }
      expect(allErrors).toEqual([]);
    });

    test('All ES files have valid JSON structure', () => {
      const esErrors = [];
      esFiles.forEach(file => {
        try {
          const data = readJson(ES_DIR, file);
          const errors = validateStructure(data.levels || data, 'es', file);
          if (errors.length > 0) {
            esErrors.push(...errors);
          }
        } catch (e) {
          esErrors.push(`es/${file}: Invalid JSON - ${e.message}`);
        }
      });

      if (esErrors.length > 0) {
        console.log('\nES Validation Errors:\n' + esErrors.join('\n'));
      }
      expect(esErrors).toEqual([]);
    });
  });

  describe('Translation Comparison', () => {
    test('EN and ES translations should be different (actually translated)', () => {
      const comparisonErrors = [];

      enFiles.forEach(file => {
        if (!esFiles.includes(file)) return;

        try {
          const enData = readJson(EN_DIR, file);
          const esData = readJson(ES_DIR, file);
          const errors = compareTranslations(enData.levels || enData, esData.levels || esData, file);
          if (errors.length > 0) {
            comparisonErrors.push(...errors);
          }
        } catch (e) {
          comparisonErrors.push(`${file}: Comparison failed - ${e.message}`);
        }
      });

      if (comparisonErrors.length > 0) {
        console.log('\nTranslation Comparison Errors:\n' + comparisonErrors.join('\n'));
      }
      expect(comparisonErrors).toEqual([]);
    });
  });

  describe('Individual File Validation Summary', () => {
    test('Generate validation report', () => {
      const report = {
        total: enFiles.length,
        enValid: 0,
        esValid: 0,
        bothValid: 0,
        issues: []
      };

      enFiles.forEach(file => {
        let enValid = true;
        let esValid = true;

        // Validate EN
        try {
          const enData = readJson(EN_DIR, file);
          const enErrors = validateStructure(enData.levels || enData, 'en', file);
          if (enErrors.length === 0) {
            report.enValid++;
          } else {
            enValid = false;
            report.issues.push({ file, lang: 'en', errors: enErrors });
          }
        } catch (e) {
          enValid = false;
          report.issues.push({ file, lang: 'en', errors: [e.message] });
        }

        // Validate ES
        if (esFiles.includes(file)) {
          try {
            const esData = readJson(ES_DIR, file);
            const esErrors = validateStructure(esData.levels || esData, 'es', file);
            if (esErrors.length === 0) {
              report.esValid++;
            } else {
              esValid = false;
              report.issues.push({ file, lang: 'es', errors: esErrors });
            }
          } catch (e) {
            esValid = false;
            report.issues.push({ file, lang: 'es', errors: [e.message] });
          }
        }

        if (enValid && esValid) {
          report.bothValid++;
        }
      });

      console.log('\n=================================');
      console.log('VALIDATION REPORT');
      console.log('=================================');
      console.log(`Total roles: ${report.total}`);
      console.log(`EN valid: ${report.enValid}/${report.total}`);
      console.log(`ES valid: ${report.esValid}/${report.total}`);
      console.log(`Both valid: ${report.bothValid}/${report.total}`);
      console.log('=================================\n');

      if (report.issues.length > 0) {
        console.log('Issues found:');
        report.issues.forEach(issue => {
          console.log(`  ${issue.file} (${issue.lang}): ${issue.errors.length} errors`);
        });
      }

      // Test passes if all files are valid
      expect(report.bothValid).toBe(report.total);
    });
  });
});
