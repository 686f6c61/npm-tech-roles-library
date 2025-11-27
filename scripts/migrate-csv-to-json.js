/**
 * Migration Script: CSV to JSON
 *
 * Converts the CSV data file to enhanced JSON format with full metadata.
 * This script enriches existing JSON translation files with category, role, level, and yearsRange data.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Paths
const CSV_PATH = path.join(__dirname, '../data/diccionario_competencias_detallado_v2.csv');
const ES_TRANSLATIONS_DIR = path.join(__dirname, '../src/i18n/translations/es');
const EN_TRANSLATIONS_DIR = path.join(__dirname, '../src/i18n/translations/en');

// Role name normalization (for filename matching)
function normalizeRoleName(roleName) {
  return roleName
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[()]/g, '')
    .replace(/\//g, '-')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Calculate years range from level
function calculateYearsRange(level) {
  const levelNum = parseInt(level.match(/\d/)[0]);

  const ranges = {
    1: { min: 0, max: 1 },
    2: { min: 1, max: 2 },
    3: { min: 2, max: 3 },
    4: { min: 3, max: 5 },
    5: { min: 5, max: 7 },
    6: { min: 7, max: 10 },
    7: { min: 10, max: 12 },
    8: { min: 12, max: 15 },
    9: { min: 15, max: null }
  };

  return ranges[levelNum] || { min: 0, max: null };
}

// Parse CSV
console.log('📖 Reading CSV file...');
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

console.log(`✅ Loaded ${records.length} records from CSV\n`);

// Group by role
const roleGroups = {};
records.forEach(record => {
  const roleName = record.Rol;
  if (!roleGroups[roleName]) {
    roleGroups[roleName] = [];
  }
  roleGroups[roleName].push(record);
});

console.log(`📊 Found ${Object.keys(roleGroups).length} unique roles\n`);

// Process each role
let processedRoles = 0;
let errors = [];

Object.entries(roleGroups).forEach(([roleName, roleRecords]) => {
  const filename = normalizeRoleName(roleName) + '.json';
  const esFilePath = path.join(ES_TRANSLATIONS_DIR, filename);
  const enFilePath = path.join(EN_TRANSLATIONS_DIR, filename);

  // Check if files exist
  if (!fs.existsSync(esFilePath)) {
    errors.push(`❌ ES file not found: ${filename}`);
    return;
  }

  if (!fs.existsSync(enFilePath)) {
    errors.push(`❌ EN file not found: ${filename}`);
    return;
  }

  try {
    // Load existing translation files
    const esData = JSON.parse(fs.readFileSync(esFilePath, 'utf-8'));
    const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'));

    // Create enhanced structure with metadata
    const category = roleRecords[0].Categoría;

    const enhancedES = {
      role: roleName,
      category: category,
      levels: {}
    };

    const enhancedEN = {
      role: roleName,
      category: category,
      levels: {}
    };

    // Process each level
    roleRecords.forEach(record => {
      const code = record['Código'];
      const level = record.Nivel;
      const yearsRange = calculateYearsRange(level);
      const levelNumber = parseInt(level.match(/\d/)[0]);

      // ES level
      if (esData[code]) {
        enhancedES.levels[code] = {
          level: level,
          levelNumber: levelNumber,
          yearsRange: yearsRange,
          coreCompetencies: esData[code].coreCompetencies || [],
          complementaryCompetencies: esData[code].complementaryCompetencies || [],
          indicators: esData[code].indicators || []
        };
      }

      // EN level
      if (enData[code]) {
        enhancedEN.levels[code] = {
          level: level,
          levelNumber: levelNumber,
          yearsRange: yearsRange,
          coreCompetencies: enData[code].coreCompetencies || [],
          complementaryCompetencies: enData[code].complementaryCompetencies || [],
          indicators: enData[code].indicators || []
        };
      }
    });

    // Write enhanced files
    fs.writeFileSync(esFilePath, JSON.stringify(enhancedES, null, 2), 'utf-8');
    fs.writeFileSync(enFilePath, JSON.stringify(enhancedEN, null, 2), 'utf-8');

    processedRoles++;
    console.log(`✅ ${processedRoles}. ${roleName}`);

  } catch (error) {
    errors.push(`❌ Error processing ${roleName}: ${error.message}`);
  }
});

console.log(`\n📊 Migration Summary:`);
console.log(`   ✅ Successfully migrated: ${processedRoles} roles`);
console.log(`   ❌ Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log(`\n❌ Errors:`);
  errors.forEach(err => console.log(`   ${err}`));
} else {
  console.log(`\n🎉 Migration completed successfully!`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Create JSON parser to replace CSV parser`);
  console.log(`   2. Update Database to load from JSON`);
  console.log(`   3. Update index.js paths`);
  console.log(`   4. Run tests`);
  console.log(`   5. Delete CSV file`);
}
