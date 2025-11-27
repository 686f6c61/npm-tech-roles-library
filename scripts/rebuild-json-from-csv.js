/**
 * Rebuild JSON files from CSV
 *
 * Completely rebuilds JSON translation files from the CSV source with full metadata.
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

// Parse competencies from semicolon-separated string
function parseCompetencies(competenciesStr) {
  if (!competenciesStr || competenciesStr.trim() === '') {
    return [];
  }
  return competenciesStr
    .split(';')
    .map(c => c.trim())
    .filter(c => c.length > 0);
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

Object.entries(roleGroups).forEach(([roleName, roleRecords]) => {
  const filename = normalizeRoleName(roleName) + '.json';
  const esFilePath = path.join(ES_TRANSLATIONS_DIR, filename);

  // Create ES structure (Spanish from CSV)
  const category = roleRecords[0].Categoría;

  const esData = {
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

    // Parse competencies from CSV (Spanish)
    const coreCompetencies = parseCompetencies(record['Competencias Core']);
    const complementaryCompetencies = parseCompetencies(record['Competencias Complementarias']);
    const indicators = parseCompetencies(record['Indicadores de Nivel']);

    esData.levels[code] = {
      level: level,
      levelNumber: levelNumber,
      yearsRange: yearsRange,
      coreCompetencies: coreCompetencies,
      complementaryCompetencies: complementaryCompetencies,
      indicators: indicators
    };
  });

  // Write ES file
  fs.writeFileSync(esFilePath, JSON.stringify(esData, null, 2), 'utf-8');

  processedRoles++;
  console.log(`✅ ${processedRoles}. ${roleName} (ES)`);
});

console.log(`\n🎉 Rebuilt ${processedRoles} ES JSON files from CSV!`);
console.log(`\n⚠️  NOTE: EN files need manual translation or existing translations`);
console.log(`   The CSV only contains Spanish data`);
