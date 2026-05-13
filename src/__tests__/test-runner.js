// 小蘿日誌 — 簡易測試 Runner
// 用於 Node.js 環境跑 console.assert 風格的測試

let _passed = 0;
let _failed = 0;
let _currentSuite = '';

export function suite(name) {
  _currentSuite = name;
  console.log(`\n--- ${name} ---`);
}

export function test(name, fn) {
  try {
    fn();
    _passed++;
    console.log(`  PASS: ${name}`);
  } catch (e) {
    _failed++;
    console.error(`  FAIL: ${name}`);
    console.error(`    ${e.message}`);
  }
}

export function assert(condition, msg = 'assertion failed') {
  if (!condition) throw new Error(msg);
}

export function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(msg || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertDeepEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(msg || `expected ${b}, got ${a}`);
  }
}

export function summary() {
  console.log(`\n=============================`);
  console.log(`Tests: ${_passed} passed, ${_failed} failed, ${_passed + _failed} total`);
  console.log(`=============================`);
  return _failed === 0;
}
