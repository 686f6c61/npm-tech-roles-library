/**
 * Demo 05 - Advanced Use Cases
 *
 * Demonstrates real-world scenarios and advanced library usage:
 * - Hiring profile analysis and candidate evaluation
 * - Team composition and skill gap analysis
 * - Career planning and development roadmaps
 * - Cross-functional role transitions
 * - Competency gap identification between current and target levels
 *
 * @module demo/05-advanced-use-cases
 * @author 686f6c61
 * @license MIT
 * @see {@link https://github.com/686f6c61/npm-tech-roles-library}
 * @see {@link https://www.npmjs.com/package/@sparring/tech-roles-library}
 */

const TechRolesLibrary = require('../src/index');

console.log('========================================');
console.log('ADVANCED USE CASES');
console.log('========================================\n');

const library = new TechRolesLibrary({ language: 'es' });

// Use Case 1: Hiring - Find candidates at right level
console.log('USE CASE 1: Hiring Profile Analysis');
console.log('----------------------------------------');
console.log('Scenario: Looking for Backend Developer with 5 years experience\n');

const yearsExp = 5;
const targetRole = 'Backend Developer';
const recommended = library.getByExperience(targetRole, yearsExp);

console.log(`Recommended Level: ${recommended.level}`);
console.log(`Code: ${recommended.code}`);
console.log(`Typical Experience Range: ${recommended.yearsRange.min}-${recommended.yearsRange.max || '+'} years\n`);

console.log('Expected competencies:');
const accumulated = library.getAccumulatedCompetencies(targetRole, recommended.level);
const totalCompetencies = accumulated.levels.reduce(
  (sum, level) => sum + level.coreCompetencies.length,
  0
);
console.log(`  Total core competencies: ${totalCompetencies}`);
console.log(`  Total levels covered: ${accumulated.levels.length}\n`);

console.log('Key indicators for this level:');
recommended.indicators.forEach((indicator, i) => {
  console.log(`  ${i + 1}. ${indicator}`);
});
console.log('\n');

// Use Case 2: Career Planning - Transition between roles
console.log('USE CASE 2: Career Transition Analysis');
console.log('----------------------------------------');
console.log('Scenario: Backend Developer L4 wants to become Full-Stack Developer\n');

const currentRole = 'Backend Developer';
const targetTransitionRole = 'Full-Stack Developer';
const currentLevel = 'L4';

const current = library.getCompetencies(currentRole, currentLevel);
const target = library.getCompetencies(targetTransitionRole, currentLevel);

console.log(`Current: ${currentRole} ${currentLevel}`);
console.log(`  Core competencies: ${current.core.length}`);
console.log(`  Complementary: ${current.complementary.length}`);
console.log('');

console.log(`Target: ${targetTransitionRole} ${currentLevel}`);
console.log(`  Core competencies: ${target.core.length}`);
console.log(`  Complementary: ${target.complementary.length}`);
console.log('');

// Calculate overlap manually
const currentSkills = new Set([...current.core, ...current.complementary]);
const targetSkills = new Set([...target.core, ...target.complementary]);
const commonSkills = [...currentSkills].filter(s => targetSkills.has(s));
const newSkills = [...targetSkills].filter(s => !currentSkills.has(s));

console.log(`Skills in common: ${commonSkills.length}`);
console.log(`New skills to acquire: ${newSkills.length}\n`);

console.log('New skills needed (first 8):');
newSkills.slice(0, 8).forEach((skill, i) => {
  console.log(`  ${i + 1}. ${skill}`);
});
console.log('\n');

// Use Case 3: Team Composition Analysis
console.log('USE CASE 3: Team Skill Coverage Analysis');
console.log('----------------------------------------');
console.log('Scenario: Analyzing skill coverage in a development team\n');

const team = [
  { role: 'Backend Developer', level: 'L4' },
  { role: 'Frontend Developer', level: 'L3' },
  { role: 'DevOps Engineer', level: 'L3' },
  { role: 'Data Engineer', level: 'L2' }
];

const teamSkills = new Set();
team.forEach(member => {
  const competencies = library.getCompetencies(member.role, member.level);
  competencies.core.forEach(skill => teamSkills.add(skill));
  competencies.complementary.forEach(skill => teamSkills.add(skill));
});

console.log('Team composition:');
team.forEach((member, i) => {
  console.log(`  ${i + 1}. ${member.role} ${member.level}`);
});
console.log(`\nTotal unique skills in team: ${teamSkills.size}\n`);

// Check coverage for a specific technology
const techToCheck = ['Docker', 'Kubernetes', 'CI/CD', 'testing'];
console.log('Technology coverage check:');
techToCheck.forEach(tech => {
  let covered = false;
  for (const skill of teamSkills) {
    if (skill.toLowerCase().includes(tech.toLowerCase())) {
      covered = true;
      break;
    }
  }
  console.log(`  ${tech}: ${covered ? 'Covered' : 'NOT covered'}`);
});
console.log('\n');

// Use Case 4: Salary Benchmarking Helper
console.log('USE CASE 4: Level Benchmarking for Compensation');
console.log('----------------------------------------');
console.log('Scenario: Understanding seniority levels for compensation\n');

const benchmarkRole = 'Machine Learning Engineer';
const levels = library.getLevelsForRole(benchmarkRole);

console.log(`Role: ${benchmarkRole}\n`);
console.log('Level progression:');

levels.forEach((level, i) => {
  const yearsMax = level.yearsRange.max ? `${level.yearsRange.max}` : '+';
  const indicators = level.indicators[0] || 'No indicators';
  console.log(`\n${level.level}`);
  console.log(`  Code: ${level.code}`);
  console.log(`  Years: ${level.yearsRange.min}-${yearsMax}`);
  console.log(`  Key indicator: ${indicators.substring(0, 80)}${indicators.length > 80 ? '...' : ''}`);
});
console.log('\n');

// Use Case 5: Skills Gap Analysis for Promotion
console.log('USE CASE 5: Promotion Readiness Analysis');
console.log('----------------------------------------');
console.log('Scenario: Developer at L3 seeking promotion to L4\n');

const promotionRole = 'Backend Developer';
const currentPromotionLevel = 'L3';

const promotionNext = library.getNextLevel(promotionRole, currentPromotionLevel);

console.log(`Current: ${promotionRole} ${currentPromotionLevel}`);
console.log(`Target: ${promotionNext.next.level}\n`);

console.log('Promotion requirements:');
console.log(`  New competencies needed: ${promotionNext.newCompetenciesCount}`);
console.log(`  Years range for next level: ${promotionNext.next.yearsRange.min}-${promotionNext.next.yearsRange.max || '+'} years\n`);

console.log('Next level full competencies:');
console.log(`  Core competencies: ${promotionNext.next.coreCompetencies.length}`);
console.log(`  Complementary competencies: ${promotionNext.next.complementaryCompetencies.length}`);
console.log(`  Indicators: ${promotionNext.next.indicators.length}\n`);

console.log('New skills to develop (first 8):');
promotionNext.newCompetencies.slice(0, 8).forEach((skill, i) => {
  console.log(`  ${i + 1}. ${skill}`);
});
console.log('\n');

// Use Case 6: Role Search and Discovery
console.log('USE CASE 6: Role Search and Discovery');
console.log('----------------------------------------');
console.log('Scenario: Finding roles by keywords\n');

const keywords = ['machine learning', 'data', 'cloud'];

keywords.forEach(keyword => {
  console.log(`Searching for "${keyword}" roles:`);
  const results = library.search(keyword, { limit: 3 });
  if (results.length > 0) {
    results.forEach(result => {
      console.log(`  - ${result.role} (${result.category})`);
    });
  } else {
    console.log(`  No roles found`);
  }
  console.log('');
});

// Use Case 7: Export Data
console.log('USE CASE 7: Data Export');
console.log('----------------------------------------');
const exportRole = 'DevOps Engineer';
const exportLevel = 'L4';
const exportData = library.getCompetencies(exportRole, exportLevel);

console.log(`Exporting: ${exportRole} ${exportLevel}\n`);

// Export as JSON
const jsonExport = library.export('json', exportData);
console.log('JSON export (first 200 characters):');
console.log(jsonExport.substring(0, 200) + '...\n');

// Export as Markdown
const mdExport = library.export('markdown', exportData);
console.log('Markdown export (first 300 characters):');
console.log(mdExport.substring(0, 300) + '...\n');

// Use Case 8: Candidate Skill Evaluation

console.log('========================================');
console.log('ADVANCED USE CASES COMPLETED');
console.log('========================================');
