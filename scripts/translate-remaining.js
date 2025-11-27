/**
 * Auto-translate remaining 17 EN files from ES using simple dictionary
 */

const fs = require('fs');
const path = require('path');

const ES_DIR = path.join(__dirname, '../src/i18n/translations/es');
const EN_DIR = path.join(__dirname, '../src/i18n/translations/en');

// Translation dictionary for common terms
const translations = {
  // Common terms
  'Conocimientos básicos': 'Basic knowledge',
  'Comprensión elemental': 'Elementary understanding',
  'Habilidad para': 'Ability to',
  'Capacidad de': 'Ability for',
  'Capacidad para': 'Ability to',
  'Dominio de': 'Mastery of',
  'Expertise en': 'Expertise in',
  'Liderazgo en': 'Leadership in',
  'Liderazgo técnico': 'Technical leadership',
  'Liderazgo ejecutivo': 'Executive leadership',
  'Liderazgo visionario': 'Visionary leadership',
  'Implementación de': 'Implementation of',
  'Gestión de': 'Management of',
  'Definición de': 'Definition of',
  'Diseño de': 'Design of',
  'Arquitectura de': 'Architecture of',
  'Dirección de': 'Direction of',
  'Transformación de': 'Transformation of',
  'Innovación en': 'Innovation in',
  'Evangelización de': 'Evangelization of',
  'Creación de': 'Creation of',
  'Influencia en': 'Influence on',
  'Conocimiento profundo de': 'Deep knowledge of',
  'Conocimiento práctico de': 'Practical knowledge of',
  'Experiencia en': 'Experience in',

  // Levels
  'Requiere supervisión constante': 'Requires constant supervision',
  'Está aprendiendo': 'Is learning',
  'Lidera': 'Leads',
  'Define': 'Defines',
  'Gestiona': 'Manages',
  'Participa en': 'Participates in',
  'Es referente en': 'Is a reference in',
  'Reporta a': 'Reports to',
  'Es parte del comité ejecutivo': 'Part of the executive committee',

  // Categories
  'Data': 'Data',
  'Software Engineering': 'Software Engineering',
  'Security': 'Security',
  'Producto': 'Product',
  'Product': 'Product',
  'AI/ML': 'AI/ML',
  'Infrastructure': 'Infrastructure'
};

// Simple word-by-word translation with dictionary
function translateText(text) {
  if (!text) return text;

  let result = text;

  // Apply dictionary translations
  Object.entries(translations).forEach(([es, en]) => {
    const regex = new RegExp(es, 'gi');
    result = result.replace(regex, en);
  });

  return result;
}

// Translate a competency array
function translateArray(arr) {
  return arr.map(item => translateText(item));
}

// Files that need translation
const filesToTranslate = [
  'data-architect.json',
  'data-engineer.json',
  'data-governance-specialist.json',
  'data-platform-engineer.json',
  'data-quality-engineer.json',
  'data-scientist.json',
  'data-visualization-specialist.json',
  'security-engineer.json',
  'security-operations-engineer.json',
  'site-reliability-engineer.json',
  'software-architect.json',
  'software-engineer.json',
  'solutions-architect.json',
  'sysadmin.json',
  'tech-lead.json',
  'technical-product-manager.json',
  'test-automation-engineer.json'
];

console.log(`🔄 Translating ${filesToTranslate.length} remaining files...\n`);

let count = 0;
filesToTranslate.forEach(filename => {
  try {
    const esPath = path.join(ES_DIR, filename);
    const enPath = path.join(EN_DIR, filename);

    // Read ES file
    const esData = JSON.parse(fs.readFileSync(esPath, 'utf-8'));

    // Create EN structure
    const enData = {
      role: esData.role,
      category: esData.category,
      levels: {}
    };

    // Translate each level
    Object.entries(esData.levels).forEach(([code, levelData]) => {
      enData.levels[code] = {
        level: levelData.level,
        levelNumber: levelData.levelNumber,
        yearsRange: levelData.yearsRange,
        coreCompetencies: translateArray(levelData.coreCompetencies),
        complementaryCompetencies: translateArray(levelData.complementaryCompetencies),
        indicators: translateArray(levelData.indicators)
      };
    });

    // Write EN file
    fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf-8');
    count++;
    console.log(`✅ ${count}/${filesToTranslate.length} ${filename}`);

  } catch (error) {
    console.error(`❌ Error translating ${filename}:`, error.message);
  }
});

console.log(`\n🎉 Translated ${count}/${filesToTranslate.length} files!`);
console.log(`\n⚠️  NOTE: These are automatic translations using dictionary.`);
console.log(`   Review for accuracy if needed.`);
