/**
 * Demo 06 - Complete Example
 *
 * Comprehensive workflow demonstration showing all library features:
 * - Bilingual role names and translations (en/es)
 * - Weighted search system with scoring
 * - Role similarity calculation
 * - Level comparison and progression analysis
 * - Integration of all major library functionalities
 *
 * @module demo/06-complete-example
 * @author 686f6c61
 * @license MIT
 * @see {@link https://github.com/686f6c61/npm-tech-roles-library}
 * @see {@link https://www.npmjs.com/package/@sparring/tech-roles-library}
 */

const TechRolesLibrary = require('../src/index');

console.log('='.repeat(80));
console.log('TECH ROLES LIBRARY - EJEMPLO COMPLETO');
console.log('='.repeat(80));
console.log();

// ========================================
// 1. TRADUCCIÓN DE NOMBRES DE ROLES
// ========================================
console.log('1. TRADUCCIÓN DE NOMBRES DE ROLES');
console.log('-'.repeat(80));

// En Español (por defecto)
const libES = new TechRolesLibrary({ language: 'es' });
const roleES = libES.getRole('DS-L4');

console.log('ESPAÑOL:');
console.log(`  Rol: ${roleES.role}`);                    // "Científico de Datos"
console.log(`  Nivel: ${roleES.level}`);
console.log(`  Código: ${roleES.code}`);
console.log(`  Core Competencies: ${roleES.coreCompetencies.length} competencias`);
console.log(`    - ${roleES.coreCompetencies[0]}`);
console.log();

// En Inglés
const libEN = new TechRolesLibrary({ language: 'en' });
const roleEN = libEN.getRole('DS-L4');

console.log('ENGLISH:');
console.log(`  Role: ${roleEN.role}`);                   // "Data Scientist"
console.log(`  Level: ${roleEN.level}`);
console.log(`  Code: ${roleEN.code}`);
console.log(`  Core Competencies: ${roleEN.coreCompetencies.length} competencies`);
console.log(`    - ${roleEN.coreCompetencies[0]}`);
console.log();

// ========================================
// 2. SISTEMA DE BÚSQUEDA CON SCORING
// ========================================
console.log('2. SISTEMA DE BÚSQUEDA CON SCORING');
console.log('-'.repeat(80));
console.log('Búsqueda: "API Docker"');
console.log();

const searchResults = libES.search('API Docker', { limit: 5 });

console.log(`Total de resultados: ${searchResults.length}`);
console.log();

searchResults.forEach((result, index) => {
  console.log(`${index + 1}. ${result.entry.role} - ${result.entry.level}`);
  console.log(`   Score: ${result.score} puntos`);
  console.log(`   Código: ${result.entry.code}`);
  console.log(`   Términos coincidentes: ${result.matchedTerms.join(', ')}`);
  console.log();
});

console.log('Explicación del Scoring:');
console.log('  - Nombre del rol: +10 puntos');
console.log('  - Categoría: +5 puntos');
console.log('  - Core competencies: +5 puntos');
console.log('  - Complementary competencies: +2 puntos');
console.log('  - Indicators: +1 punto');
console.log();

// ========================================
// 3. SIMILITUD ENTRE ROLES (Jaccard Index)
// ========================================
console.log('3. SIMILITUD ENTRE ROLES (Jaccard Index)');
console.log('-'.repeat(80));

const comparison = libES.compareRoles('Backend Developer', 'Frontend Developer', 'L3');

console.log(`Rol 1: ${comparison.role1.name} (${comparison.role1.code})`);
console.log(`Rol 2: ${comparison.role2.name} (${comparison.role2.code})`);
console.log();
console.log(`SIMILITUD: ${(comparison.similarity * 100).toFixed(1)}%`);
console.log();
console.log('Estadísticas:');
console.log(`  - Total competencias Rol 1: ${comparison.statistics.totalCompetencies1}`);
console.log(`  - Total competencias Rol 2: ${comparison.statistics.totalCompetencies2}`);
console.log(`  - Competencias compartidas: ${comparison.statistics.commonCount}`);
console.log(`  - Únicas del Rol 1: ${comparison.statistics.unique1Count}`);
console.log(`  - Únicas del Rol 2: ${comparison.statistics.unique2Count}`);
console.log();

console.log('Competencias compartidas (primeras 3):');
comparison.common.slice(0, 3).forEach((comp, i) => {
  console.log(`  ${i + 1}. ${comp}`);
});
console.log();

console.log('Fórmula de Similitud:');
console.log(`  similitud = competencias_comunes / total_únicas`);
console.log(`  similitud = ${comparison.statistics.commonCount} / ${comparison.statistics.totalCompetencies1 + comparison.statistics.totalCompetencies2 - comparison.statistics.commonCount}`);
console.log(`  similitud = ${comparison.similarity}`);
console.log();

// ========================================
// 4. ENCONTRAR ROLES SIMILARES
// ========================================
console.log('4. ENCONTRAR ROLES SIMILARES');
console.log('-'.repeat(80));
console.log('Buscando roles similares a "Backend Developer" (threshold: 30%)');
console.log();

const similarRoles = libES.findSimilarRoles('Backend Developer', 0.3);

console.log(`Encontrados ${similarRoles.length} roles similares:`);
console.log();

similarRoles.slice(0, 5).forEach((item, index) => {
  console.log(`${index + 1}. ${item.role}`);
  console.log(`   Similitud: ${(item.avgSimilarity * 100).toFixed(1)}%`);
  console.log(`   Competencias compartidas (promedio): ${item.avgCommonCount.toFixed(0)}`);
  console.log();
});

// ========================================
// 5. COMPARACIÓN DE NIVELES (Growth Rate)
// ========================================
console.log('5. COMPARACIÓN DE NIVELES (Growth Rate)');
console.log('-'.repeat(80));

const levelComparison = libES.compareLevels('Backend Developer', 'L2', 'L5');

console.log(`Rol: ${levelComparison.role}`);
console.log(`Desde: ${levelComparison.fromLevel.level} (${levelComparison.fromLevel.code})`);
console.log(`Hasta: ${levelComparison.toLevel.level} (${levelComparison.toLevel.code})`);
console.log();
console.log('Análisis del crecimiento:');
console.log(`  - Competencias mantenidas: ${levelComparison.statistics.maintainedCount}`);
console.log(`  - Competencias nuevas: ${levelComparison.statistics.newCount}`);
console.log(`  - Competencias obsoletas: ${levelComparison.statistics.deprecatedCount}`);
console.log(`  - TASA DE CRECIMIENTO: ${levelComparison.statistics.growthRate}%`);
console.log();

console.log('Nuevas competencias requeridas (primeras 3):');
levelComparison.new.slice(0, 3).forEach((comp, i) => {
  console.log(`  ${i + 1}. ${comp}`);
});
console.log();

console.log('Explicación de Growth Rate:');
console.log(`  growth_rate = (competencias_nuevas / competencias_nivel_actual) × 100`);
console.log(`  growth_rate = (${levelComparison.statistics.newCount} / ${levelComparison.statistics.maintainedCount + levelComparison.statistics.deprecatedCount}) × 100`);
console.log(`  growth_rate = ${levelComparison.statistics.growthRate}%`);
console.log();

// ========================================
// 6. ESTADÍSTICAS GENERALES
// ========================================
console.log('6. ESTADÍSTICAS GENERALES');
console.log('-'.repeat(80));

const stats = libES.getStatistics();

console.log(`Total de roles: ${stats.totalRoles}`);
console.log(`Total de entries (roles × niveles): ${stats.totalEntries}`);
console.log(`Total de categorías: ${stats.totalCategories}`);
console.log();

console.log('Categorías disponibles:');
const categories = libES.getCategories();
categories.forEach((cat, i) => {
  console.log(`  ${i + 1}. ${cat}`);
});
console.log();

// ========================================
// 7. FILTRADO POR CATEGORÍA
// ========================================
console.log('7. FILTRADO POR CATEGORÍA');
console.log('-'.repeat(80));
console.log('Filtrando roles de la categoría: "Software Engineering"');
console.log();

const swEngRoles = libES.filterByCategory('Software Engineering').slice(0, 5);

console.log(`Primeros 5 roles encontrados:`);
swEngRoles.forEach((entry, i) => {
  console.log(`  ${i + 1}. ${entry.role} - ${entry.level} (${entry.code})`);
});
console.log();

// ========================================
// FIN
// ========================================
console.log('='.repeat(80));
console.log('Para más información sobre el sistema de scoring y similitud:');
console.log('Consulta: README.md - Sección "Understanding the scoring & similarity algorithms"');
console.log('='.repeat(80));
