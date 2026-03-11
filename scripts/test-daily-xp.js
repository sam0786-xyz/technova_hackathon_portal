/**
 * Daily XP Distribution Test Script
 * 
 * Tests the new daily XP calculation logic
 * Run: node scripts/test-daily-xp.js
 */

// Simulate the daily XP calculation logic
// In production, this is in lib/xp/calculator.ts

function getEventDayCount(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Reset to start of day for accurate day count
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    // Calculate difference in days
    const diffMs = endDay.getTime() - startDay.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(1, diffDays);
}

function calculateDailyXP(totalXP, eventDays) {
    return Math.floor(totalXP / eventDays);
}

// Test Cases
console.log('========================================');
console.log('Daily XP Distribution Test Suite');
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

// Event Day Count Tests
console.log('--- Event Day Count Tests ---');
test('Single day event (same date)',
    getEventDayCount('2025-01-01T10:00:00', '2025-01-01T18:00:00'),
    1);

test('2-day event',
    getEventDayCount('2025-01-01T10:00:00', '2025-01-02T18:00:00'),
    2);

test('3-day event',
    getEventDayCount('2025-01-01T10:00:00', '2025-01-03T18:00:00'),
    3);

test('5-day event',
    getEventDayCount('2025-01-01T10:00:00', '2025-01-05T18:00:00'),
    5);

test('Week-long event (7 days)',
    getEventDayCount('2025-01-01T10:00:00', '2025-01-07T18:00:00'),
    7);

// Daily XP Calculation Tests
console.log('--- Daily XP Calculation Tests ---');
test('900 XP / 3 days = 300/day',
    calculateDailyXP(900, 3),
    300);

test('720 XP / 3 days = 240/day',
    calculateDailyXP(720, 3),
    240);

test('80 XP / 1 day = 80/day',
    calculateDailyXP(80, 1),
    80);

test('100 XP / 2 days = 50/day',
    calculateDailyXP(100, 2),
    50);

// Rounding test (floor)
test('100 XP / 3 days = 33/day (floor)',
    calculateDailyXP(100, 3),
    33);

// Real World Scenarios
console.log('--- Real World Scenarios ---');

// 3-day Hackathon Elite: 900 XP total
const hackathonXP = 900;
const hackathonDays = getEventDayCount('2025-01-01T10:00:00', '2025-01-03T18:00:00');
const hackathonDailyXP = calculateDailyXP(hackathonXP, hackathonDays);
test('Hackathon event days', hackathonDays, 3);
test('Hackathon daily XP', hackathonDailyXP, 300);
test('Hackathon total if all days checked in', hackathonDailyXP * hackathonDays, 900);

// Remainder handling scenario
// If user checks in 2 of 3 days, they get 600 XP (lost 300)
const missedDayXP = hackathonDailyXP * 2;
test('Hackathon XP if missed 1 day', missedDayXP, 600);

// Last day remainder handling
// 100 XP / 3 days = 33/day, last day should get 34 (100 - 33 - 33 = 34)
const totalWith100 = 100;
const daysFor100 = 3;
const dailyFor100 = calculateDailyXP(totalWith100, daysFor100); // 33
const lastDayXP = totalWith100 - (dailyFor100 * (daysFor100 - 1)); // 100 - 66 = 34
test('Last day gets remainder (100 XP / 3 days)', lastDayXP, 34);

// Summary
console.log('========================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('========================================');

if (failed > 0) {
    process.exit(1);
}
