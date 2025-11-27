/**
 * Demo 03 - Career Path Examples
 *
 * Demonstrates career progression and development features:
 * - View all levels for a role
 * - Get next level requirements
 * - Calculate accumulated competencies
 * - View complete career path
 * - Experience-based level recommendations
 *
 * @module demo/03-career-path
 * @author 686f6c61
 * @license MIT
 * @see {@link https://github.com/686f6c61/npm-tech-roles-library}
 * @see {@link https://www.npmjs.com/package/@sparring/tech-roles-library}
 */

const TechRolesLibrary = require('../src/index');

console.log('========================================');
console.log('CAREER PATH EXAMPLES');
console.log('========================================\n');

const library = new TechRolesLibrary({ language: 'es' });

// Example 1: View all levels for Backend Developer
console.log('1. All Backend Developer Levels (L1 to L9)');
console.log('----------------------------------------');
const allLevels = library.getLevelsForRole('Backend Developer');
console.log(`Total levels: ${allLevels.length}\n`);

allLevels.forEach((level, i) => {
  const yearsMax = level.yearsRange.max ? `${level.yearsRange.max}` : '20+';
  console.log(`${i + 1}. ${level.level} (${level.code})`);
  console.log(`   Years: ${level.yearsRange.min}-${yearsMax}`);
  console.log(`   Core competencies: ${level.coreCompetencies.length}`);
  console.log(`   Complementary: ${level.complementaryCompetencies.length}`);
  console.log(`   Indicators: ${level.indicators.length}`);
  console.log('');
});

// Example 2: Get next level requirements
console.log('2. Next Level Requirements: Backend Developer L3 to L4');
console.log('----------------------------------------');
const nextLevel = library.getNextLevel('Backend Developer', 'L3');
console.log(`Current: ${nextLevel.current.level}`);
console.log(`  Years: ${nextLevel.current.yearsRange.min}-${nextLevel.current.yearsRange.max || '+'}`);
console.log('');
console.log(`Next: ${nextLevel.next.level}`);
console.log(`  Code: ${nextLevel.next.code}`);
console.log(`  Years: ${nextLevel.next.yearsRange.min}-${nextLevel.next.yearsRange.max || '+'}`);
console.log(`  Core competencies: ${nextLevel.next.coreCompetencies.length}`);
console.log(`  Complementary: ${nextLevel.next.complementaryCompetencies.length}`);
console.log(`  Indicators: ${nextLevel.next.indicators.length}`);
console.log('');
console.log(`New competencies to acquire: ${nextLevel.newCompetenciesCount}\n`);
console.log('Examples of new competencies:');
nextLevel.newCompetencies.slice(0, 5).forEach((comp, i) => {
  console.log(`  ${i + 1}. ${comp}`);
});
console.log('');

// Example 3: Accumulated competencies
console.log('3. What should a Backend Developer L3 know (accumulated)');
console.log('----------------------------------------');
const accumulated = library.getAccumulatedCompetencies('Backend Developer', 'L3');
console.log(`Role: ${accumulated.role}`);
console.log(`Target Level: ${accumulated.targetLevel}`);
console.log(`Accumulated levels: ${accumulated.levels.length}\n`);

let totalCore = 0;
let totalComp = 0;
let totalIndicators = 0;
accumulated.levels.forEach(level => {
  console.log(`${level.level}:`);
  console.log(`  Core competencies: ${level.coreCompetencies.length}`);
  console.log(`  Complementary competencies: ${level.complementaryCompetencies.length}`);
  console.log(`  Indicators: ${level.indicators.length}`);
  totalCore += level.coreCompetencies.length;
  totalComp += level.complementaryCompetencies.length;
  totalIndicators += level.indicators.length;
  console.log('');
});

console.log('Summary:');
console.log(`  Total core competencies: ${totalCore}`);
console.log(`  Total complementary competencies: ${totalComp}`);
console.log(`  Total indicators: ${totalIndicators}`);
console.log(`  Grand total: ${totalCore + totalComp + totalIndicators}`);
console.log('');

// Example 4: Experience-based level recommendation
console.log('4. Experience-based Level Recommendation');
console.log('----------------------------------------');
const experienceTests = [1, 3, 7, 12, 18];
console.log('Backend Developer level recommendations by experience:\n');
experienceTests.forEach(years => {
  const recommended = library.getByExperience('Backend Developer', years);
  const maxYears = recommended.yearsRange.max || '20+';
  console.log(`  ${years} years -> ${recommended.level} (${recommended.code})`);
  console.log(`    Expected range: ${recommended.yearsRange.min}-${maxYears} years`);
});
console.log('');

// Example 5: Complete career path view (mastered + current + growth)
console.log('5. Complete Career Path View - Backend Developer L5');
console.log('----------------------------------------');
const completeCareer = library.getCareerPathComplete('Backend Developer', 'L5');
console.log(`Role: ${completeCareer.role}\n`);

console.log('MASTERED LEVELS:');
console.log(`  Count: ${completeCareer.masteredLevels.length}`);
console.log(`  Total competencies mastered: ${completeCareer.summary.totalMasteredCompetencies}`);
completeCareer.masteredLevels.forEach(level => {
  console.log(`  - ${level.level} (${level.code})`);
});
console.log('');

console.log('CURRENT LEVEL:');
console.log(`  Level: ${completeCareer.currentLevel.level} (${completeCareer.currentLevel.code})`);
console.log(`  Years range: ${completeCareer.currentLevel.yearsRange.min}-${completeCareer.currentLevel.yearsRange.max || '+'} years`);
console.log(`  Core competencies: ${completeCareer.currentLevel.coreCompetencies.length}`);
console.log(`  Complementary competencies: ${completeCareer.currentLevel.complementaryCompetencies.length}`);
console.log(`  Indicators: ${completeCareer.currentLevel.indicators.length}`);
console.log(`  Current level competencies: ${completeCareer.summary.currentLevelCompetencies}`);
console.log('');

console.log('GROWTH PATH:');
console.log(`  Levels to grow: ${completeCareer.growthPath.length}`);
console.log(`  Competencies remaining to learn: ${completeCareer.summary.remainingToLearn}`);
console.log(`  Career progress: ${completeCareer.summary.progressPercentage}%`);
completeCareer.growthPath.forEach(level => {
  console.log(`  - ${level.level} (${level.code})`);
});
console.log('');

// Example 6: Compare career paths for different roles
console.log('6. Compare Career Paths: Backend vs Frontend vs Full-Stack');
console.log('----------------------------------------');
const roles = ['Backend Developer', 'Frontend Developer', 'Full-Stack Developer'];
console.log('Career progression comparison at L3:\n');

roles.forEach(role => {
  const roleData = library.getRoleByName(role, 'L3');
  console.log(`${role}:`);
  console.log(`  Code: ${roleData.code}`);
  console.log(`  Core competencies: ${roleData.coreCompetencies.length}`);
  console.log(`  Complementary: ${roleData.complementaryCompetencies.length}`);
  console.log(`  Indicators: ${roleData.indicators.length}`);
  console.log('');
});

// Example 7: View progression for Data roles
console.log('7. Data Scientist Career Levels');
console.log('----------------------------------------');
const dataLevels = library.getLevelsForRole('Data Scientist');
console.log(`Total levels for Data Scientist: ${dataLevels.length}\n`);

dataLevels.slice(0, 5).forEach((level, i) => {
  const maxYears = level.yearsRange.max || '20+';
  console.log(`${i + 1}. ${level.level}`);
  console.log(`   Years: ${level.yearsRange.min}-${maxYears}`);
  console.log(`   Total competencies: ${level.coreCompetencies.length + level.complementaryCompetencies.length}`);
});
console.log('\n... (and 4 more levels)');
console.log('');

console.log('========================================');
console.log('CAREER PATH EXAMPLES COMPLETED');
console.log('========================================');
