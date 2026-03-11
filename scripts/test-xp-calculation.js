/**
 * XP Calculation Test Script
 * 
 * Run: node scripts/test-xp-calculation.js
 */

// Simulate the XP calculation logic for testing purposes
// In production, this is in lib/xp/calculator.ts

const BASE_XP = {
    talk_seminar: 50,
    workshop: 80,
    hackathon: 150,
    competition: 100
};

const DIFFICULTY_MULTIPLIERS = {
    easy: 1.0,
    moderate: 1.3,
    hard: 1.6,
    elite: 2.0
};

function getDurationMultiplier(startTime, endTime, isMultiDay) {
    if (isMultiDay) return 3.0;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60);

    if (start.toDateString() !== end.toDateString()) return 3.0;
    if (durationHours <= 1) return 1.0;
    if (durationHours <= 2) return 1.2;
    if (durationHours <= 4) return 1.5;
    if (durationHours <= 24) return 2.0;
    return 3.0;
}

function calculateXP(eventType, difficulty, startTime, endTime, isMultiDay = false) {
    const base = BASE_XP[eventType] || 80;
    const duration = getDurationMultiplier(startTime, endTime, isMultiDay);
    const diff = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
    return Math.round(base * duration * diff);
}

// Test Cases
console.log('========================================');
console.log('XP Calculation Test Suite');
console.log('========================================\n');

let passed = 0;
let failed = 0;

function test(name, actual, expected) {
    if (actual === expected) {
        console.log(`✅ PASS: ${name}`);
        console.log(`   Expected: ${expected}, Got: ${actual}\n`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Expected: ${expected}, Got: ${actual}\n`);
        failed++;
    }
}

// Base XP Tests
console.log('--- Base XP Tests ---');
test('Talk/Seminar base XP', BASE_XP.talk_seminar, 50);
test('Workshop base XP', BASE_XP.workshop, 80);
test('Hackathon base XP', BASE_XP.hackathon, 150);
test('Competition base XP', BASE_XP.competition, 100);

// Difficulty Multiplier Tests
console.log('--- Difficulty Multiplier Tests ---');
test('Easy multiplier', DIFFICULTY_MULTIPLIERS.easy, 1.0);
test('Moderate multiplier', DIFFICULTY_MULTIPLIERS.moderate, 1.3);
test('Hard multiplier', DIFFICULTY_MULTIPLIERS.hard, 1.6);
test('Elite multiplier', DIFFICULTY_MULTIPLIERS.elite, 2.0);

// Duration Multiplier Tests
console.log('--- Duration Multiplier Tests ---');
test('≤1 hour duration', getDurationMultiplier('2025-01-01T10:00:00', '2025-01-01T10:30:00', false), 1.0);
test('1-2 hours duration', getDurationMultiplier('2025-01-01T10:00:00', '2025-01-01T11:30:00', false), 1.2);
test('2-4 hours duration', getDurationMultiplier('2025-01-01T10:00:00', '2025-01-01T13:00:00', false), 1.5);
test('Full day duration', getDurationMultiplier('2025-01-01T10:00:00', '2025-01-01T20:00:00', false), 2.0);
test('Multi-day flag', getDurationMultiplier('2025-01-01T10:00:00', '2025-01-03T18:00:00', true), 3.0);
test('Multi-day by date', getDurationMultiplier('2025-01-01T10:00:00', '2025-01-02T18:00:00', false), 3.0);

// Combined Calculation Tests
console.log('--- Combined XP Calculation Tests ---');

// Workshop, 1 hour, Easy = 80 × 1.0 × 1.0 = 80 XP
test('Workshop 1hr Easy',
    calculateXP('workshop', 'easy', '2025-01-01T10:00:00', '2025-01-01T11:00:00'),
    80);

// Hackathon, Multi-day, Elite = 150 × 3.0 × 2.0 = 900 XP
test('Hackathon Multi-day Elite',
    calculateXP('hackathon', 'elite', '2025-01-01T10:00:00', '2025-01-03T18:00:00', true),
    900);

// Competition, 3 hours, Hard = 100 × 1.5 × 1.6 = 240 XP
test('Competition 3hr Hard',
    calculateXP('competition', 'hard', '2025-01-01T10:00:00', '2025-01-01T13:00:00'),
    240);

// Talk/Seminar, Full day, Moderate = 50 × 2.0 × 1.3 = 130 XP
test('Talk Full-day Moderate',
    calculateXP('talk_seminar', 'moderate', '2025-01-01T09:00:00', '2025-01-01T17:00:00'),
    130);

// Hackathon from requirements: Multi-day Hard = 150 × 3.0 × 1.6 = 720 XP
test('Hackathon Multi-day Hard (from spec)',
    calculateXP('hackathon', 'hard', '2025-01-01T10:00:00', '2025-01-03T18:00:00', true),
    720);

// Edge Cases
console.log('--- Edge Case Tests ---');

// Missing/invalid values should use defaults
test('Unknown event type defaults to workshop',
    calculateXP('unknown', 'easy', '2025-01-01T10:00:00', '2025-01-01T11:00:00'),
    80);

// Summary
console.log('========================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('========================================');

if (failed > 0) {
    process.exit(1);
}
