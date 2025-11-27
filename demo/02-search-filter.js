/**
 * Demo 02 - Search and Filter Examples
 *
 * Demonstrates search and filtering capabilities:
 * - Search by role name
 * - Search by category
 * - Filter by category
 * - Filter by experience level
 *
 * @module demo/02-search-filter
 * @author 686f6c61
 * @license MIT
 * @see {@link https://github.com/686f6c61/npm-tech-roles-library}
 * @see {@link https://www.npmjs.com/package/@sparring/tech-roles-library}
 */

const TechRolesLibrary = require('../src/index');

console.log('========================================');
console.log('SEARCH AND FILTER EXAMPLES');
console.log('========================================\n');

const library = new TechRolesLibrary({ language: 'es' });

// Example 1: Search by role name
console.log('1. Search by role name: "backend"');
console.log('----------------------------------------');
const searchResults = library.search('backend', { limit: 5 });
console.log(`Found ${searchResults.length} results\n`);
searchResults.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.role}`);
  console.log(`     Category: ${result.category}`);
  console.log(`     Match score: ${result.matchScore}`);
  console.log(`     Matched in: ${result.matchedIn}`);
  console.log('');
});

// Example 2: Search for data-related roles
console.log('2. Search for "data" roles');
console.log('----------------------------------------');
const dataResults = library.search('data', { limit: 10 });
console.log(`Found ${dataResults.length} data-related roles\n`);
console.log('First 5 results:');
dataResults.slice(0, 5).forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.role} (${result.category})`);
});
console.log('');

// Example 3: Search for DevOps and related roles
console.log('3. Search for DevOps-related roles');
console.log('----------------------------------------');
const devopsResults = library.search('devops');
console.log(`Found ${devopsResults.length} DevOps-related roles\n`);
devopsResults.forEach((roleData, i) => {
  console.log(`  ${i + 1}. ${roleData.role} (${roleData.category})`);
  console.log(`     Match score: ${roleData.matchScore}`);
});

// Example 4: Filter by category
console.log('4. Filter by category: "AI & Machine Learning"');
console.log('----------------------------------------');
const aiRoles = library.filterByCategory('Software Engineering');
console.log(`Found ${aiRoles.length} entries in Software Engineering\n`);

// Group by role
const roleGroups = new Map();
aiRoles.forEach(entry => {
  if (!roleGroups.has(entry.role)) {
    roleGroups.set(entry.role, []);
  }
  roleGroups.get(entry.role).push(entry.level);
});

console.log('Unique roles:');
let count = 0;
for (const [role, levels] of roleGroups) {
  if (count >= 5) break;
  console.log(`  ${count + 1}. ${role} (${levels.length} levels)`);
  count++;
}
console.log('');

// Example 5: Filter by level number
console.log('5. Filter by level: L6 (Senior I)');
console.log('----------------------------------------');
const seniorRoles = library.filterByLevel(6);
console.log(`Found ${seniorRoles.length} Senior I level entries\n`);
console.log('Sample roles at L6:');
const uniqueL6Roles = [...new Set(seniorRoles.map(e => e.role))];
uniqueL6Roles.slice(0, 8).forEach((role, i) => {
  console.log(`  ${i + 1}. ${role}`);
});
console.log('');

// Example 6: Search for machine learning roles
console.log('6. Search for "machine learning" roles');
console.log('----------------------------------------');
const mlResults = library.search('machine learning', { limit: 5 });
console.log(`Found ${mlResults.length} results\n`);
mlResults.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.role}`);
  console.log(`     Category: ${result.category}`);
  console.log(`     Match score: ${result.matchScore}`);
  console.log('');
});

// Example 7: Validate role and level
console.log('7. Validation examples');
console.log('----------------------------------------');
const rolesToValidate = [
  { role: 'Backend Developer', level: 'L3' },
  { role: 'Invalid Role', level: 'L1' },
  { role: 'Frontend Developer', level: 'L10' }
];

rolesToValidate.forEach((test, i) => {
  const roleExists = library.validateRole(test.role);
  const levelExists = roleExists ? library.validateLevel(test.role, test.level) : false;

  console.log(`  ${i + 1}. ${test.role} - ${test.level}`);
  console.log(`     Role exists: ${roleExists}`);
  console.log(`     Level exists: ${levelExists}`);
  console.log('');
});

console.log('========================================');
console.log('SEARCH AND FILTER EXAMPLES COMPLETED');
console.log('========================================');
