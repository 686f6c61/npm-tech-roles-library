/**
 * Demo 01 - Basic Usage Examples
 *
 * Demonstrates fundamental operations of the Tech Roles Library:
 * - Get all available roles
 * - Get specific role by code
 * - Get all role-level entries for a specific role
 * - Retrieve detailed information about roles and competencies
 *
 * @module demo/01-basic-usage
 * @author 686f6c61
 * @license MIT
 * @see {@link https://github.com/686f6c61/npm-tech-roles-library}
 * @see {@link https://www.npmjs.com/package/@sparring/tech-roles-library}
 */

const TechRolesLibrary = require('../src/index');

console.log('========================================');
console.log('BASIC USAGE EXAMPLES');
console.log('========================================\n');

// Initialize library
const library = new TechRolesLibrary({ language: 'es' });

// Example 1: Get all available roles
console.log('1. All available roles');
console.log('----------------------------------------');
const roles = library.getRoles();
console.log(`Total roles: ${roles.length}`);
console.log('\nFirst 10 roles:');
roles.slice(0, 10).forEach((role, index) => {
  console.log(`  ${index + 1}. ${role}`);
});
console.log('');

// Example 2: Get specific role by code
console.log('2. Get Backend Developer L3 by code');
console.log('----------------------------------------');
const role = library.getRole('BE-L3');
console.log(`Role: ${role.role}`);
console.log(`Level: ${role.level}`);
console.log(`Code: ${role.code}`);
console.log(`Years Range: ${role.yearsRange.min}-${role.yearsRange.max || '+'} years`);
console.log(`\nCore Competencies (first 3):`);
role.coreCompetencies.slice(0, 3).forEach((comp, i) => {
  console.log(`  ${i + 1}. ${comp}`);
});
console.log('');

// Example 3: Get all levels for a role
console.log('3. All levels for Backend Developer');
console.log('----------------------------------------');
const levels = library.getLevelsForRole('Backend Developer');
console.log(`Total levels: ${levels.length}\n`);
levels.forEach(level => {
  const yearsMax = level.yearsRange.max ? `${level.yearsRange.max}` : '+';
  console.log(`  ${level.level.padEnd(20)} (${level.code}) - ${level.yearsRange.min}-${yearsMax} years`);
});
console.log('');

// Example 4: Get competencies for specific level
console.log('4. Competencies for Backend Developer L3');
console.log('----------------------------------------');
const competencies = library.getCompetencies('Backend Developer', 'L3');
console.log(`Core Competencies: ${competencies.core.length}`);
console.log(`Complementary Competencies: ${competencies.complementary.length}`);
console.log(`Indicators: ${competencies.indicators.length}`);
console.log('\nCore Competencies:');
competencies.core.forEach((comp, i) => {
  console.log(`  ${i + 1}. ${comp}`);
});
console.log('');

// Example 5: Get role by experience years
console.log('5. Backend Developer with 5 years of experience');
console.log('----------------------------------------');
const experienceRole = library.getByExperience('Backend Developer', 5);
console.log(`Recommended Level: ${experienceRole.level}`);
console.log(`Code: ${experienceRole.code}`);
console.log(`Years Range: ${experienceRole.yearsRange.min}-${experienceRole.yearsRange.max || '+'} years`);
console.log('');

// Example 6: Get all categories
console.log('6. Available categories');
console.log('----------------------------------------');
const categories = library.getCategories();
console.log(`Total categories: ${categories.length}\n`);
categories.forEach((cat, i) => {
  const rolesInCat = library.filterByCategory(cat);
  console.log(`  ${i + 1}. ${cat} (${rolesInCat.length} entries)`);
});
console.log('');

// Example 7: Database statistics
console.log('7. Database statistics');
console.log('----------------------------------------');
const stats = library.getStatistics();
console.log(`Total Roles: ${stats.totalRoles}`);
console.log(`Total Categories: ${stats.totalCategories}`);
console.log(`Total Entries: ${stats.totalEntries}`);
console.log(`Average Entries per Role: ${stats.averageEntriesPerRole}`);
console.log('');

// Example 8: Get all roles with complete metadata
console.log('8. Complete catalog of all 78 roles with metadata');
console.log('----------------------------------------');
const catalog = library.getAllRolesWithMetadata();
console.log(`Total roles in catalog: ${catalog.summary.totalRoles}`);
console.log(`Total levels across all roles: ${catalog.summary.totalLevels}`);
console.log(`Categories: ${catalog.summary.totalCategories}\n`);

console.log('Sample roles with metadata (first 3):');
catalog.roles.slice(0, 3).forEach((roleData, i) => {
  console.log(`  ${i + 1}. ${roleData.role}`);
  console.log(`     Category: ${roleData.category}`);
  console.log(`     Available levels: ${roleData.levelCount} levels`);
  console.log(`     Years range: ${roleData.yearsRange.min}-${roleData.yearsRange.max || '+'} years`);
  console.log(`     Total competencies: ${roleData.statistics.totalCompetencies}`);
  console.log(`     Levels: ${roleData.availableLevels.map(l => l.level).join(', ')}`);
  console.log('');
});

console.log('Roles by category (Software Engineering):');
const seRoles = catalog.byCategory['Software Engineering'];
console.log(`  Total Software Engineering roles: ${seRoles.length}`);
seRoles.slice(0, 3).forEach((roleData, i) => {
  console.log(`  ${i + 1}. ${roleData.role} - ${roleData.levelCount} levels`);
});
console.log('');

console.log('========================================');
console.log('BASIC USAGE EXAMPLES COMPLETED');
console.log('========================================');
