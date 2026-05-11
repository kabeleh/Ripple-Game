const TEST_TIMEZONES = [
    'Pacific/Honolulu',
    'UTC',
    'Australia/Sydney',
    'America/Los_Angeles',
];

const playedDate = '2026-05-11';
const launchDate = '2025-12-30';

function getDateInHST(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Pacific/Honolulu',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

function legacyYesterdayFromPlayedDate(today) {
    const d = new Date(`${today}T12:00:00`);
    d.setDate(d.getDate() - 1);
    return getDateInHST(d);
}

function fixedYesterdayFromPlayedDate(today) {
    const d = new Date(`${today}T12:00:00-10:00`);
    d.setDate(d.getDate() - 1);
    return getDateInHST(d);
}

function simulateStreak(lastPlayedDate, currentStreak, today, yesterdayFn) {
    if (lastPlayedDate === today) return currentStreak;
    return lastPlayedDate === yesterdayFn(today) ? currentStreak + 1 : 1;
}

function legacyDayNumber(dateStr) {
    const currentDate = new Date(`${dateStr}T12:00:00`);
    const launch = new Date(`${launchDate}T12:00:00`);
    const diffTime = currentDate.getTime() - launch.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function fixedDayNumber(dateStr) {
    const currentDate = new Date(`${dateStr}T12:00:00-10:00`);
    const launch = new Date(`${launchDate}T12:00:00-10:00`);
    const diffTime = currentDate.getTime() - launch.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

let failed = false;

for (const tz of TEST_TIMEZONES) {
    process.env.TZ = tz;

    const legacyConsecutive = simulateStreak('2026-05-10', 1, playedDate, legacyYesterdayFromPlayedDate);
    const legacyMissed = simulateStreak('2026-05-09', 1, playedDate, legacyYesterdayFromPlayedDate);

    const fixedConsecutive = simulateStreak('2026-05-10', 1, playedDate, fixedYesterdayFromPlayedDate);
    const fixedMissed = simulateStreak('2026-05-09', 1, playedDate, fixedYesterdayFromPlayedDate);
    const legacyDay = legacyDayNumber(playedDate);
    const fixedDay = fixedDayNumber(playedDate);

    console.log(`${tz}:`);
    console.log(`  legacy yesterday=${legacyYesterdayFromPlayedDate(playedDate)} consecutive=${legacyConsecutive} missed=${legacyMissed}`);
    console.log(`  fixed  yesterday=${fixedYesterdayFromPlayedDate(playedDate)} consecutive=${fixedConsecutive} missed=${fixedMissed}`);
    console.log(`  legacy dayNumber=${legacyDay} fixed dayNumber=${fixedDay}`);

    if (fixedConsecutive !== 2 || fixedMissed !== 1) {
        failed = true;
        console.error(`  FAIL: fixed behavior is incorrect in ${tz}`);
    }

    if (fixedDay !== 133) {
        failed = true;
        console.error(`  FAIL: fixed day number expected 133 but got ${fixedDay} in ${tz}`);
    }
}

if (failed) {
    process.exitCode = 1;
    console.error('\nStreak timezone validation failed.');
} else {
    console.log('\nStreak timezone validation passed.');
}
